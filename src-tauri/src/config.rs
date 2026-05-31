use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub auto_lock_minutes: u32,
    pub clipboard_clear_seconds: u32,
    pub backup_path: Option<String>,
    pub lock_on_minimise: bool,
    pub always_on_top: bool,
    pub theme: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            auto_lock_minutes: 30,
            clipboard_clear_seconds: 60,
            backup_path: None,
            lock_on_minimise: false,
            always_on_top: false,
            theme: "system".to_string(),
        }
    }
}

pub fn load_config(path: &Path) -> AppConfig {
    std::fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

pub fn save_config(path: &Path, config: &AppConfig) -> Result<(), String> {
    let json = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Serialize error: {e}"))?;
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| format!("Create dir error: {e}"))?;
    }
    std::fs::write(path, json).map_err(|e| format!("Write error: {e}"))?;
    Ok(())
}
