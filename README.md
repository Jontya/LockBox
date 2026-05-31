# LockBox

A local-first encrypted credential vault for Windows. Store API keys, tokens, and account credentials — encrypted on disk, never leaving your machine.

Built with Tauri v2 (Rust backend) + React/TypeScript frontend.

## What it does

- Stores credentials encrypted with AES-256-GCM
- Derives encryption key from master password via Argon2id (memory-hard, no fast brute-force)
- Organises entries into named buckets
- Auto-locks after configurable idle timeout
- Exports encrypted backup; imports from CSV or JSON
- Zero network requests — enforced via Tauri CSP

## Security properties

- Master password never stored — only the derived key exists in memory, discarded on lock
- Vault file is opaque ciphertext; useless without the password
- Constant-time unlock path — always runs full Argon2id derivation regardless of input
- No credentials written to logs, config, or disk outside the vault file
- Config file stores UI preferences only (theme, timeout) — never vault data

## Tech stack

| Layer | Tech |
|---|---|
| Desktop shell | Tauri v2 |
| Frontend | React 19, TypeScript, Vite |
| Styling | Tailwind CSS v3 |
| State | Zustand |
| Encryption | AES-256-GCM (`aes-gcm` crate) |
| KDF | Argon2id (`argon2` crate) |
| Icons | Lucide React |

## Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) stable toolchain
- Windows: Visual Studio Build Tools with C++ workload + WebView2 runtime

> WSL2: `npm run build` works. `npm run tauri build` (native binary) requires a Windows host.

## Development

```bash
npm install
npm run dev        # Vite dev server (frontend only)
npm run tauri dev  # Full Tauri app with hot reload (Windows/Linux with GTK)
```

## Production build

Run on a Windows host:

```bash
npm run tauri build
```

Output: `src-tauri/target/release/bundle/`
- `msi/LockBox_0.1.0_x64_en-US.msi`
- `nsis/LockBox_0.1.0_x64-setup.exe`

## Project structure

```
src/
  components/
    setup/      # First-run wizard (welcome → password → backup → complete)
    unlock/     # Master password entry screen
    vault/      # Main vault UI (buckets, entries, modals, search)
    settings/   # Settings panel + change-password modal
    import/     # CSV/JSON import modal
  lib/          # Tauri API wrapper
  store/        # Zustand vault state
src-tauri/
  src/
    commands.rs # Tauri command handlers
    vault.rs    # Encryption, serialisation, file I/O
    config.rs   # Config read/write
    state.rs    # In-memory key state
```

## Keyboard shortcuts

| Key | Action |
|---|---|
| `Ctrl+F` / `/` | Global search |
| `Escape` | Close modal / search / settings |
| `Enter` | Confirm focused action |
| Tab | Navigate fields and buttons |
