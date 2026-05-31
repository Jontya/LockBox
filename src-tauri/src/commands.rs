use tauri::Manager;
use crate::config::{self, AppConfig};
use crate::state::{ConfigState, VaultState};
use crate::vault::{self, VaultData};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::State;

// ── Path helpers ──────────────────────────────────────────────────────────────

fn vault_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Cannot resolve app data dir: {e}"))?;
    std::fs::create_dir_all(&dir).map_err(|e| format!("Cannot create app data dir: {e}"))?;
    Ok(dir.join("vault.dat"))
}

fn config_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Cannot resolve app data dir: {e}"))?;
    Ok(dir.join("config.json"))
}

// ── Setup & Auth ──────────────────────────────────────────────────────────────

#[tauri::command]
pub fn vault_exists(app: tauri::AppHandle) -> bool {
    vault_path(&app)
        .map(|p| p.exists())
        .unwrap_or(false)
}

#[tauri::command]
pub fn create_vault(
    app: tauri::AppHandle,
    password: String,
    vault_state: State<VaultState>,
) -> Result<(), String> {
    let path = vault_path(&app)?;

    // Generate random salt and nonce
    let mut salt = [0u8; 32];
    let mut nonce = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut salt);
    rand::thread_rng().fill_bytes(&mut nonce);

    // Derive key with production params: m=2^16=64MB, t=3, p=1
    let mut key = vault::derive_key(&password, &salt, 16, 3, 1)?;

    // Encrypt empty vault
    let empty_vault = VaultData::new();
    let plaintext = serde_json::to_vec(&empty_vault)
        .map_err(|e| format!("Serialize error: {e}"))?;
    let ciphertext = vault::encrypt_vault(&key, &nonce, &plaintext)?;

    // Write vault file
    vault::write_vault_file(&path, 16, 3, 1, &salt, &nonce, &ciphertext)?;

    // Store key in memory (vault is now unlocked)
    let mut state = vault_state.0.lock().map_err(|_| "Lock poisoned".to_string())?;
    *state = Some(key.clone());

    // Zeroize key copy
    use zeroize::Zeroize;
    key.zeroize();

    Ok(())
}

#[tauri::command]
pub fn unlock_vault(
    app: tauri::AppHandle,
    password: String,
    vault_state: State<VaultState>,
) -> Result<bool, String> {
    let path = vault_path(&app)?;

    // Always read vault file — constant time start
    let contents = vault::read_vault_file(&path)?;

    // Always run full Argon2id derivation — never short-circuit
    let mut key = vault::derive_key(
        &password,
        &contents.salt,
        contents.m_cost_exp,
        contents.t_cost,
        contents.p_cost,
    )?;

    // Attempt decryption
    let result = vault::decrypt_vault(&key, &contents.nonce, &contents.ciphertext);

    match result {
        Ok(_plaintext) => {
            // Correct password — store key
            let mut state = vault_state.0.lock().map_err(|_| "Lock poisoned".to_string())?;
            *state = Some(key.clone());
            use zeroize::Zeroize;
            key.zeroize();
            Ok(true)
        }
        Err(_) => {
            // Wrong password — zeroize and return false
            use zeroize::Zeroize;
            key.zeroize();
            Ok(false)
        }
    }
}

#[tauri::command]
pub fn lock_vault(vault_state: State<VaultState>) -> Result<(), String> {
    let mut state = vault_state.0.lock().map_err(|_| "Lock poisoned".to_string())?;
    if let Some(mut key) = state.take() {
        use zeroize::Zeroize;
        key.zeroize();
    }
    Ok(())
}

#[tauri::command]
pub fn change_password(
    app: tauri::AppHandle,
    current: String,
    new_password: String,
    vault_state: State<VaultState>,
) -> Result<(), String> {
    let path = vault_path(&app)?;

    // Read and verify current password
    let contents = vault::read_vault_file(&path)?;
    let current_key = vault::derive_key(
        &current,
        &contents.salt,
        contents.m_cost_exp,
        contents.t_cost,
        contents.p_cost,
    )?;
    let plaintext = vault::decrypt_vault(&current_key, &contents.nonce, &contents.ciphertext)
        .map_err(|_| "Current password incorrect".to_string())?;

    // New salt, nonce, key
    let mut new_salt = [0u8; 32];
    let mut new_nonce = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut new_salt);
    rand::thread_rng().fill_bytes(&mut new_nonce);
    let mut new_key = vault::derive_key(&new_password, &new_salt, 16, 3, 1)?;

    // Re-encrypt with new key
    let new_ciphertext = vault::encrypt_vault(&new_key, &new_nonce, &plaintext)?;
    vault::write_vault_file(&path, 16, 3, 1, &new_salt, &new_nonce, &new_ciphertext)?;

    // Update in-memory key
    let mut state = vault_state.0.lock().map_err(|_| "Lock poisoned".to_string())?;
    if let Some(mut old) = state.take() {
        use zeroize::Zeroize;
        old.zeroize();
    }
    *state = Some(new_key.clone());
    use zeroize::Zeroize;
    new_key.zeroize();

    Ok(())
}

// ── Vault CRUD ────────────────────────────────────────────────────────────────

fn require_key(vault_state: &State<VaultState>) -> Result<Vec<u8>, String> {
    let state = vault_state.0.lock().map_err(|_| "Lock poisoned".to_string())?;
    state.clone().ok_or_else(|| "Vault is locked".to_string())
}

#[tauri::command]
pub fn get_vault_data(
    app: tauri::AppHandle,
    vault_state: State<VaultState>,
) -> Result<VaultData, String> {
    let key = require_key(&vault_state)?;
    let path = vault_path(&app)?;
    let contents = vault::read_vault_file(&path)?;
    let plaintext = vault::decrypt_vault(&key, &contents.nonce, &contents.ciphertext)?;
    let data: VaultData = serde_json::from_slice(&plaintext)
        .map_err(|e| format!("Deserialize error: {e}"))?;
    Ok(data)
}

#[tauri::command]
pub fn save_vault_data(
    app: tauri::AppHandle,
    vault_state: State<VaultState>,
    config_state: State<ConfigState>,
    data: VaultData,
) -> Result<(), String> {
    let key = require_key(&vault_state)?;
    let path = vault_path(&app)?;

    // Read existing header to preserve salt + params
    let contents = vault::read_vault_file(&path)?;

    // New nonce on every save
    let mut new_nonce = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut new_nonce);

    let plaintext = serde_json::to_vec(&data)
        .map_err(|e| format!("Serialize error: {e}"))?;
    let ciphertext = vault::encrypt_vault(&key, &new_nonce, &plaintext)?;

    vault::write_vault_file(
        &path,
        contents.m_cost_exp,
        contents.t_cost,
        contents.p_cost,
        &contents.salt,
        &new_nonce,
        &ciphertext,
    )?;

    // Auto-backup if configured
    let backup_path = {
        let cfg = config_state.0.lock().map_err(|_| "Lock poisoned".to_string())?;
        cfg.backup_path.clone()
    };
    if let Some(bp) = backup_path {
        let backup = PathBuf::from(bp).join("vault.dat");
        let _ = std::fs::copy(&path, &backup); // best-effort, don't fail save
    }

    Ok(())
}

// ── Config ────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_config(
    _app: tauri::AppHandle,
    config_state: State<ConfigState>,
) -> Result<AppConfig, String> {
    let cfg = config_state.0.lock().map_err(|_| "Lock poisoned".to_string())?;
    Ok(cfg.clone())
}

#[tauri::command]
pub fn save_config(
    app: tauri::AppHandle,
    config_state: State<ConfigState>,
    config: AppConfig,
) -> Result<(), String> {
    let path = config_path(&app)?;
    config::save_config(&path, &config)?;
    let mut state = config_state.0.lock().map_err(|_| "Lock poisoned".to_string())?;
    *state = config;
    Ok(())
}

// ── Backup ────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn set_backup_path(
    app: tauri::AppHandle,
    config_state: State<ConfigState>,
    path: String,
) -> Result<(), String> {
    let config_file = config_path(&app)?;
    let mut state = config_state.0.lock().map_err(|_| "Lock poisoned".to_string())?;
    state.backup_path = Some(path);
    config::save_config(&config_file, &state)?;
    Ok(())
}

#[tauri::command]
pub fn backup_now(
    app: tauri::AppHandle,
    config_state: State<ConfigState>,
) -> Result<(), String> {
    let vault = vault_path(&app)?;
    let cfg = config_state.0.lock().map_err(|_| "Lock poisoned".to_string())?;
    let bp = cfg.backup_path.as_ref().ok_or("No backup path configured")?;
    let dest = PathBuf::from(bp).join("vault.dat");
    if let Some(parent) = dest.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Create dir error: {e}"))?;
    }
    std::fs::copy(&vault, &dest).map_err(|e| format!("Backup copy error: {e}"))?;
    Ok(())
}

// ── Import helpers ────────────────────────────────────────────────────────────

#[derive(Debug, Serialize, Deserialize)]
pub struct ParsedEntry {
    pub label: String,
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CsvParseResult {
    pub headers: Vec<String>,
    pub preview_rows: Vec<Vec<String>>,
    pub total_rows: usize,
}

#[tauri::command]
pub fn parse_env_file(content: String) -> Result<Vec<ParsedEntry>, String> {
    let entries = content
        .lines()
        .filter(|line| {
            let trimmed = line.trim();
            !trimmed.is_empty() && !trimmed.starts_with('#')
        })
        .filter_map(|line| {
            let eq = line.find('=')?;
            let key = line[..eq].trim().to_string();
            let value = line[eq + 1..].trim().to_string();
            if key.is_empty() {
                return None;
            }
            Some(ParsedEntry { label: key, value })
        })
        .collect();
    Ok(entries)
}

#[tauri::command]
pub fn parse_csv_file(content: String) -> Result<CsvParseResult, String> {
    let mut lines = content.lines();
    let headers: Vec<String> = lines
        .next()
        .unwrap_or("")
        .split(',')
        .map(|h| h.trim().trim_matches('"').to_string())
        .collect();

    let all_rows: Vec<Vec<String>> = lines
        .map(|line| {
            line.split(',')
                .map(|cell| cell.trim().trim_matches('"').to_string())
                .collect()
        })
        .collect();

    let total_rows = all_rows.len();
    let preview_rows = all_rows.into_iter().take(3).collect();

    Ok(CsvParseResult {
        headers,
        preview_rows,
        total_rows,
    })
}
