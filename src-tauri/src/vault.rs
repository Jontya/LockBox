use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Key, Nonce,
};
use argon2::{Algorithm, Argon2, Params, Version};
use serde::{Deserialize, Serialize};
use std::path::Path;
use uuid::Uuid;

// ── Data structures ──────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum VaultEntry {
    ApiKey {
        id: String,
        label: String,
        value: String,
        notes: String,
        created_at: String,
        archived: bool,
    },
    Account {
        id: String,
        label: String,
        username: String,
        password: String,
        notes: String,
        created_at: String,
        archived: bool,
    },
}

impl VaultEntry {
    pub fn id(&self) -> &str {
        match self {
            VaultEntry::ApiKey { id, .. } => id,
            VaultEntry::Account { id, .. } => id,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Bucket {
    pub id: String,
    pub name: String,
    pub color: String,
    pub created_at: String,
    pub entries: Vec<VaultEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VaultData {
    pub version: u8,
    pub buckets: Vec<Bucket>,
}

impl VaultData {
    pub fn new() -> Self {
        Self {
            version: 1,
            buckets: Vec::new(),
        }
    }
}

// ── Vault file on-disk representation ────────────────────────────────────────

pub struct VaultFileContents {
    pub version: u8,
    pub m_cost_exp: u8,
    pub t_cost: u8,
    pub p_cost: u8,
    pub salt: [u8; 32],
    pub nonce: [u8; 12],
    pub ciphertext: Vec<u8>,
}

// ── Argon2id key derivation ───────────────────────────────────────────────────

pub fn derive_key(password: &str, salt: &[u8], m_cost_exp: u8, t_cost: u8, p_cost: u8) -> Result<Vec<u8>, String> {
    let m_cost = 1u32 << m_cost_exp; // e.g. 2^16 = 65536 KB = 64 MB
    let params = Params::new(m_cost, t_cost as u32, p_cost as u32, Some(32))
        .map_err(|e| format!("Argon2 params error: {e}"))?;
    let argon2 = Argon2::new(Algorithm::Argon2id, Version::V0x13, params);
    let mut output = vec![0u8; 32];
    argon2
        .hash_password_into(password.as_bytes(), salt, &mut output)
        .map_err(|e| format!("Argon2 hash error: {e}"))?;
    Ok(output)
}

// ── AES-256-GCM encrypt / decrypt ────────────────────────────────────────────

pub fn encrypt_vault(key: &[u8], nonce_bytes: &[u8], plaintext: &[u8]) -> Result<Vec<u8>, String> {
    let key = Key::<Aes256Gcm>::from_slice(key);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(nonce_bytes);
    cipher
        .encrypt(nonce, plaintext)
        .map_err(|e| format!("Encryption error: {e}"))
}

pub fn decrypt_vault(key: &[u8], nonce_bytes: &[u8], ciphertext: &[u8]) -> Result<Vec<u8>, String> {
    let key = Key::<Aes256Gcm>::from_slice(key);
    let cipher = Aes256Gcm::new(key);
    let nonce = Nonce::from_slice(nonce_bytes);
    cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed".to_string()) // intentionally vague — no oracle
}

// ── File I/O ──────────────────────────────────────────────────────────────────

pub fn write_vault_file(
    path: &Path,
    m_cost_exp: u8,
    t_cost: u8,
    p_cost: u8,
    salt: &[u8; 32],
    nonce: &[u8; 12],
    ciphertext: &[u8],
) -> Result<(), String> {
    let mut data = Vec::with_capacity(1 + 3 + 32 + 12 + ciphertext.len());
    data.push(0x01u8); // version
    data.push(m_cost_exp);
    data.push(t_cost);
    data.push(p_cost);
    data.extend_from_slice(salt);
    data.extend_from_slice(nonce);
    data.extend_from_slice(ciphertext);

    // Atomic write: write to .tmp, then rename
    let tmp_path = path.with_extension("dat.tmp");
    std::fs::write(&tmp_path, &data).map_err(|e| format!("Write error: {e}"))?;
    std::fs::rename(&tmp_path, path).map_err(|e| format!("Rename error: {e}"))?;
    Ok(())
}

pub fn read_vault_file(path: &Path) -> Result<VaultFileContents, String> {
    let data = std::fs::read(path).map_err(|e| format!("Read error: {e}"))?;
    if data.len() < 48 {
        return Err("Vault file too short".to_string());
    }
    let version = data[0];
    let m_cost_exp = data[1];
    let t_cost = data[2];
    let p_cost = data[3];
    let mut salt = [0u8; 32];
    salt.copy_from_slice(&data[4..36]);
    let mut nonce = [0u8; 12];
    nonce.copy_from_slice(&data[36..48]);
    let ciphertext = data[48..].to_vec();
    Ok(VaultFileContents {
        version,
        m_cost_exp,
        t_cost,
        p_cost,
        salt,
        nonce,
        ciphertext,
    })
}

// ── Helpers ────────────────────────────────────────────────────────────────────

pub fn new_uuid() -> String {
    Uuid::new_v4().to_string()
}

pub fn now_iso() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let secs = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();
    format!("{}", secs)
}

// ── Unit tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use rand::RngCore;

    fn random_salt() -> [u8; 32] {
        let mut salt = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut salt);
        salt
    }

    fn random_nonce() -> [u8; 12] {
        let mut nonce = [0u8; 12];
        rand::thread_rng().fill_bytes(&mut nonce);
        nonce
    }

    #[test]
    fn test_derive_key_produces_32_bytes() {
        let salt = random_salt();
        let key = derive_key("testpassword", &salt, 10, 1, 1).unwrap();
        assert_eq!(key.len(), 32);
    }

    #[test]
    fn test_derive_key_same_inputs_same_output() {
        let salt = random_salt();
        let k1 = derive_key("password", &salt, 10, 1, 1).unwrap();
        let k2 = derive_key("password", &salt, 10, 1, 1).unwrap();
        assert_eq!(k1, k2);
    }

    #[test]
    fn test_derive_key_different_passwords_different_output() {
        let salt = random_salt();
        let k1 = derive_key("password1", &salt, 10, 1, 1).unwrap();
        let k2 = derive_key("password2", &salt, 10, 1, 1).unwrap();
        assert_ne!(k1, k2);
    }

    #[test]
    fn test_encrypt_decrypt_roundtrip() {
        let salt = random_salt();
        let nonce = random_nonce();
        let key = derive_key("testpassword", &salt, 10, 1, 1).unwrap();
        let plaintext = b"Hello, LockBox! This is secret data.";
        let ciphertext = encrypt_vault(&key, &nonce, plaintext).unwrap();
        assert_ne!(&ciphertext[..], plaintext);
        let decrypted = decrypt_vault(&key, &nonce, &ciphertext).unwrap();
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn test_decrypt_wrong_key_fails() {
        let salt = random_salt();
        let nonce = random_nonce();
        let key = derive_key("correct", &salt, 10, 1, 1).unwrap();
        let wrong_key = derive_key("wrong", &salt, 10, 1, 1).unwrap();
        let plaintext = b"sensitive data";
        let ciphertext = encrypt_vault(&key, &nonce, plaintext).unwrap();
        let result = decrypt_vault(&wrong_key, &nonce, &ciphertext);
        assert!(result.is_err());
    }

    #[test]
    fn test_encrypt_decrypt_empty_plaintext() {
        let salt = random_salt();
        let nonce = random_nonce();
        let key = derive_key("pw", &salt, 10, 1, 1).unwrap();
        let plaintext = b"";
        let ciphertext = encrypt_vault(&key, &nonce, plaintext).unwrap();
        let decrypted = decrypt_vault(&key, &nonce, &ciphertext).unwrap();
        assert_eq!(decrypted, plaintext);
    }

    #[test]
    fn test_vault_data_serializes_roundtrip() {
        let mut vault = VaultData::new();
        vault.buckets.push(Bucket {
            id: new_uuid(),
            name: "Test Bucket".to_string(),
            color: "blue".to_string(),
            created_at: "2026-01-01".to_string(),
            entries: vec![
                VaultEntry::ApiKey {
                    id: new_uuid(),
                    label: "Test Key".to_string(),
                    value: "sk-abc123".to_string(),
                    notes: "".to_string(),
                    created_at: "2026-01-01".to_string(),
                    archived: false,
                },
            ],
        });
        let json = serde_json::to_string(&vault).unwrap();
        let decoded: VaultData = serde_json::from_str(&json).unwrap();
        assert_eq!(decoded.buckets.len(), 1);
        assert_eq!(decoded.buckets[0].name, "Test Bucket");
        assert_eq!(decoded.buckets[0].entries.len(), 1);
    }

    #[test]
    fn test_file_write_read_roundtrip() {
        use std::fs;
        let dir = std::env::temp_dir();
        let path = dir.join("lockbox_test_vault.dat");
        let salt = random_salt();
        let nonce = random_nonce();
        let ciphertext = vec![1u8, 2, 3, 4, 5];

        write_vault_file(&path, 10, 1, 1, &salt, &nonce, &ciphertext).unwrap();
        let contents = read_vault_file(&path).unwrap();

        assert_eq!(contents.version, 1);
        assert_eq!(contents.m_cost_exp, 10);
        assert_eq!(contents.t_cost, 1);
        assert_eq!(contents.p_cost, 1);
        assert_eq!(contents.salt, salt);
        assert_eq!(contents.nonce, nonce);
        assert_eq!(contents.ciphertext, ciphertext);

        fs::remove_file(&path).ok();
    }
}
