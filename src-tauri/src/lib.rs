mod vault;
mod config;
mod state;
mod commands;

use state::{ConfigState, VaultState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .manage(VaultState::new())
        .manage(ConfigState::new(config::AppConfig::default()))
        .invoke_handler(tauri::generate_handler![
            commands::vault_exists,
            commands::create_vault,
            commands::unlock_vault,
            commands::lock_vault,
            commands::change_password,
            commands::get_vault_data,
            commands::save_vault_data,
            commands::get_config,
            commands::save_config,
            commands::set_backup_path,
            commands::backup_now,
            commands::parse_env_file,
            commands::parse_csv_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
