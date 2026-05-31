# LockBox — Build Progress

## Status
Last updated: 2026-05-31
Current session: 1

## Steps

[DONE] Step 1: Project scaffold, .gitignore, .claude setup, git init
[DONE] Step 2: Rust core — vault structs, crypto primitives, config, state, unit tests
[PENDING] Step 3: Tauri commands — commands.rs, register in main.rs
[PENDING] Step 4: Frontend shell — Zustand store, App.tsx routing, typed invoke wrappers, clipboard lib, types
[PENDING] Step 5: Setup flow UI — SetupFlow, WelcomeStep, CreatePasswordStep, BackupStep, CompleteStep
[PENDING] Step 6: Unlock screen UI — lockout logic, countdown, auto-lock message
[PENDING] Step 7: Main vault layout + TopBar + auto-lock timer + lock-on-minimise
[PENDING] Step 8: Bucket panel + CreateBucketModal + ConfirmDeleteBucketModal + context menu
[PENDING] Step 9: Entry list + EntryCard components
[PENDING] Step 10: EntryDetailModal + AddEditEntryModal + ConfirmDeleteEntryModal
[PENDING] Step 11: Global search overlay
[PENDING] Step 12: Settings panel + ChangePasswordModal
[PENDING] Step 13: Import flow — .env and CSV
[PENDING] Step 14: Polish — keyboard nav, focus traps, loading states, error handling, testing
[PENDING] Step 15: Build + packaging — tauri build, verify .msi/.exe

## Session Notes
Fresh project. Started 2026-05-31.

## Session 1 Notes (2026-05-31)

### Environment
- WSL2 Linux on Windows (6.6.87.2-microsoft-standard-WSL2)
- Tauri v2 — `cargo build` fails on WSL without GTK/WebKit headers (pkg-config missing libsoup-3.0, javascriptcoregtk). This is EXPECTED — build/run must happen on Windows host or fully provisioned WSL.
- Rust unit tests (pure crypto, no Tauri deps) DO compile and run on WSL. Ran in temp crate to verify — all 8 pass.

### Architecture decisions made
- Vault key: `Arc<Mutex<Option<Vec<u8>>>>` in VaultState — never written to disk
- Argon2id params (production): m=65536 (2^16 KB = 64MB), t=3, p=1
- Argon2id params (unit tests): m=1024 (2^10 KB = 1MB), t=1, p=1 — faster tests
- AES-256-GCM nonce: 12 bytes, regenerated on every save
- Vault file: atomic write via .dat.tmp → rename to vault.dat
- `decrypt_vault()` returns intentionally vague error ("Decryption failed") — no oracle
- `now_iso()` currently returns Unix timestamp string — sufficient for sorting. Add `chrono` crate if real ISO8601 dates needed.
- CSP: `default-src 'self'; script-src 'self'; connect-src 'none'` — zero network

### Key files created (Steps 1-2)
- src-tauri/src/vault.rs — VaultEntry enum, Bucket, VaultData, all crypto functions, 8 unit tests
- src-tauri/src/config.rs — AppConfig struct + defaults + load/save
- src-tauri/src/state.rs — VaultState, ConfigState
- src-tauri/src/lib.rs — modules declared, states registered in Tauri builder
- src-tauri/Cargo.toml — argon2, aes-gcm, rand, uuid, zeroize, serde, tauri-plugin-fs, tauri-plugin-dialog
- src-tauri/tauri.conf.json — LockBox title, 1000x680 window, CSP enforced
- src-tauri/capabilities/default.json — fs + dialog permissions
- tailwind.config.js, src/index.css — Tailwind v3 configured

### Next step: Step 3
Create src-tauri/src/commands.rs with all Tauri commands:
- vault_exists, create_vault, unlock_vault, lock_vault, change_password
- get_vault_data, save_vault_data
- get_config, save_config
- set_backup_path, backup_now
- parse_env_file, parse_csv_file
Register all in lib.rs via .invoke_handler(tauri::generate_handler![...])
Vault path: use tauri::Manager + app.path().app_data_dir() to get %APPDATA%/LockBox/
