# LockBox — Build Progress

## Status
Last updated: 2026-05-31
Current session: 2

## Steps

[DONE] Step 1: Project scaffold, .gitignore, .claude setup, git init
[DONE] Step 2: Rust core — vault structs, crypto primitives, config, state, unit tests
[DONE] Step 3: Tauri commands — commands.rs, register in lib.rs
[DONE] Step 4: Frontend shell — Zustand store, App.tsx routing, typed invoke wrappers, clipboard lib, types
[DONE] Step 5: Setup flow UI — SetupFlow, WelcomeStep, CreatePasswordStep, BackupStep, CompleteStep
[DONE] Step 6: Unlock screen UI — lockout logic, countdown, auto-lock message
[DONE] Step 7: Main vault layout + TopBar + auto-lock timer + lock-on-minimise
[DONE] Step 8: Bucket panel + CreateBucketModal + ConfirmDeleteBucketModal + context menu
[DONE] Step 9: Entry list + EntryCard components
[DONE] Step 10: EntryDetailModal + AddEditEntryModal + ConfirmDeleteEntryModal
[DONE] Step 11: Global search overlay
[DONE] Step 12: Settings panel + ChangePasswordModal
[DONE] Step 13: Import flow — .env and CSV
[DONE] Step 14: Polish — keyboard nav, focus traps, loading states, error handling
[PENDING] Step 15: Build + packaging — tauri build on Windows, verify .msi/.exe

## Step 15: Windows Build Instructions

Step 15 requires running on Windows (tauri build fails on WSL — no GTK/WebKit).

### Prerequisites (Windows)
- Rust toolchain: https://rustup.rs
- Node.js 18+
- Microsoft Visual Studio Build Tools (C++ workload)
- WebView2 (usually pre-installed on Windows 10/11)

### Build command
```
cd C:\path\to\LockBox
npm run tauri build
```

### Output locations
- MSI installer: `src-tauri/target/release/bundle/msi/LockBox_0.1.0_x64_en-US.msi`
- NSIS exe: `src-tauri/target/release/bundle/nsis/LockBox_0.1.0_x64-setup.exe`

### Tauri.conf.json
- `targets: "all"` — builds both MSI and NSIS .exe
- CSP: `default-src 'self'; script-src 'self'; connect-src 'none'` — zero network enforced
- Window: 1000x680, min 800x560

## Session Notes

### Session 1 (2026-05-31)
- Steps 1-2 completed
- WSL2 environment: cargo build fails (missing GTK/WebKit). Expected. Use Windows for final build.
- All crypto in Rust: Argon2id (m=64MB, t=3, p=1), AES-256-GCM
- Key lives in Arc<Mutex<Option<Vec<u8>>>> — never written to disk

### Session 2 (2026-05-31)
- Steps 3-14 completed
- All frontend components built and reviewed
- npm run build (Vite+TS) passes clean — 281KB bundle
- cargo check clean (no Rust code errors, only expected WSL system dep error)

### Architecture Summary
- Rust backend: vault.rs (crypto), config.rs, state.rs, commands.rs (13 Tauri commands)
- Frontend: React 18 + TypeScript + Zustand + Tailwind v3
- App states: loading → setup | locked → unlocked
- All vault state in memory only (VaultState), config on disk as JSON
- Atomic vault writes: .dat.tmp → rename
- All modals have focus traps, Escape-to-close, error toasts
- Import: .env and CSV supported
- Auto-lock: configurable timeout + lock-on-minimise
- Lockout: 5→30s, 10→5min, 15+→exit(0)
