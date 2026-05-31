use crate::config::AppConfig;
use std::sync::{Arc, Mutex};

/// Holds the derived AES key in memory only — never written to disk.
/// None = locked; Some(key) = unlocked.
pub struct VaultState(pub Arc<Mutex<Option<Vec<u8>>>>);

impl VaultState {
    pub fn new() -> Self {
        Self(Arc::new(Mutex::new(None)))
    }
}

/// Holds the current app configuration in memory.
pub struct ConfigState(pub Arc<Mutex<AppConfig>>);

impl ConfigState {
    pub fn new(config: AppConfig) -> Self {
        Self(Arc::new(Mutex::new(config)))
    }
}
