# LockBox — Claude Code Development Prompt

> Paste this entire document into Claude Code at the start of your session.
> Place it in the root of your empty project directory before beginning.

---

## AGENT IDENTITY & MISSION

You are a senior full-stack engineer building **LockBox** — a local-first, encrypted credential vault for Windows. You will build this project from scratch in an empty directory using **Tauri v2 + React (TypeScript)** for the frontend and **Rust** for all security-sensitive backend logic.

Your job is to work autonomously, step by step, committing after every completed step and maintaining a living `PROGRESS.md` file so any new session can resume exactly where the last one left off.

---

## SESSION MANAGEMENT RULES (READ FIRST, ALWAYS FOLLOW)

### On Every Session Start
1. Check if `PROGRESS.md` exists in the project root
2. If it exists — read it fully, find the first `[PENDING]` item, resume from there
3. If it does not exist — you are in a fresh session, begin from Step 1

### After Every Completed Step
1. `git add -A && git commit -m "Step N: <description>"`
2. Append to `PROGRESS.md`: `[DONE] Step N: <description>`
3. Update the next step's status from `[PENDING]` to the current step indicator

### Session Limit Guardrails
Monitor your context usage. When you estimate you are approaching ~80% of the context window:
1. Finish the current atomic task cleanly (do not leave half-written files)
2. Run a final commit
3. Append to `PROGRESS.md`:
   ```
   [SESSION LIMIT APPROACHING]
   Stopped at: Step N mid-point — <what was just completed>
   Next action: <exactly what to do next, specific file and function>
   Pending sub-tasks:
   - <sub-task 1>
   - <sub-task 2>
   ```
4. Stop. Do not attempt to squeeze in more work.

### Auto-Compacting
This is a large project. If you are using a tool that supports `/compact` or context compaction:
- Trigger compaction after Step 3 (project scaffold complete)
- Trigger again after Step 7 (core encryption + vault complete)
- Trigger again after Step 11 (main UI complete)
- Always compact before starting a new major section

### Resuming After a Limit
When starting a new session on an existing project:
```
1. Read PROGRESS.md
2. Read the [SESSION LIMIT APPROACHING] block if present
3. Read the specific files mentioned in "Next action"
4. Continue from exactly that point
```

---

## PROJECT OVERVIEW

**Name:** LockBox  
**Type:** Windows desktop application (Tauri v2 + React + Rust)  
**Purpose:** Local-first encrypted credential vault — stores API keys and account credentials, fully offline, zero outgoing network requests  
**Vault location:** `%APPDATA%\LockBox\vault.dat`  
**Config location:** `%APPDATA%\LockBox\config.json`

---

## TECHNOLOGY STACK

| Layer | Technology |
|---|---|
| Desktop framework | Tauri v2 |
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS v3 |
| Backend/Security | Rust |
| Password hashing | Argon2id (`argon2` crate) |
| Encryption | AES-256-GCM (`aes-gcm` crate) |
| Unique IDs | `uuid` crate (v4) |
| Serialisation | `serde` + `serde_json` |
| File I/O | Tauri's `fs` plugin (scoped) |
| Random number gen | `rand` crate |

---

## SECURITY CONSTRAINTS (NON-NEGOTIABLE)

1. **Zero outgoing network requests** — enforce via Tauri CSP. The app must never make any HTTP/HTTPS calls to external domains. Configure `tauri.conf.json` CSP to block all external requests.
2. **No credentials in config.json** — `config.json` stores only UI preferences (timeouts, backup path). Never write any vault data or derived keys there.
3. **No credentials in logs** — ensure no sensitive values are ever passed to `println!`, `eprintln!`, or `log::*` macros.
4. **Keys live in memory only** — the derived AES key from Argon2id must only ever exist as an in-memory Tauri state value. Never write it to disk in any form.
5. **Constant-time failure** — the unlock flow must always run the full Argon2id derivation regardless of whether the password looks correct. Never short-circuit.

---

## VAULT FILE FORMAT

### On-disk layout (`vault.dat`)
```
[1 byte]  version (currently: 0x01)
[1 byte]  argon2 m_cost exponent (m = 2^n KB, default n=16 → 64MB)
[1 byte]  argon2 t_cost (iterations, default: 3)
[1 byte]  argon2 p_cost (parallelism, default: 1)
[32 bytes] salt (random, generated once at setup, never changes)
[12 bytes] nonce (random, regenerated on every save)
[remaining bytes] AES-256-GCM ciphertext
```

### Decrypted blob (JSON)
```json
{
  "version": 1,
  "buckets": [
    {
      "id": "uuid-v4",
      "name": "Anthropic",
      "color": "blue",
      "created_at": "2025-01-12T00:00:00Z",
      "entries": [
        {
          "id": "uuid-v4",
          "type": "api_key",
          "label": "Production Key",
          "value": "sk-ant-...",
          "notes": "",
          "created_at": "2025-01-12T00:00:00Z",
          "archived": false
        },
        {
          "id": "uuid-v4",
          "type": "account",
          "label": "Console Login",
          "username": "me@email.com",
          "password": "...",
          "notes": "",
          "created_at": "2025-01-15T00:00:00Z",
          "archived": false
        }
      ]
    }
  ]
}
```

### Config file (`config.json`) — never contains credentials
```json
{
  "auto_lock_minutes": 30,
  "clipboard_clear_seconds": 60,
  "backup_path": null,
  "lock_on_minimise": false,
  "always_on_top": false,
  "theme": "system"
}
```

---

## COMPLETE FEATURE SPECIFICATION

### Application States
1. **First Run (Setup Flow)** — `vault.dat` does not exist
2. **Locked** — `vault.dat` exists, vault is not decrypted in memory
3. **Unlocked** — vault is decrypted, user is active

---

### SETUP FLOW (First Run Only)

**Step A — Welcome Screen**
- LockBox logo/name centered
- Tagline: "Your local credential vault"
- Single "Get Started" button
- No other elements

**Step B — Create Master Password**
- Two masked password inputs: "Master Password" and "Confirm Password"
- Show/hide toggle on both fields
- Non-blocking strength indicator (visual bar only): Weak / Fair / Strong / Very Strong
- Password rules: minimum 4 characters ONLY — no character type requirements, no blocklist, no maximum length
- Strength indicator is purely informational, never blocks submission
- Prominent warning callout (styled visibly, not fine print):
  > "LockBox cannot recover your password. If you forget it, your vault cannot be accessed. There is no reset."
- "Create Vault" button — disabled until both fields match and meet minimum length

**Step C — Backup Location (Optional)**
- Prompt: "We recommend choosing a backup location. LockBox will copy your vault here on every save."
- "Choose Location" button → native folder picker dialog
- "Skip for Now" button
- Both proceed to Step D

**Step D — Setup Complete**
- "LockBox is ready." confirmation
- Display vault file path so user knows where data lives
- "Open LockBox" button → enters main vault (already unlocked, no re-auth needed)

---

### UNLOCK SCREEN (Every App Launch After Setup)

**Layout**
- Single centered card on clean background
- LockBox logo/name at top
- Single password input, masked by default, with show/hide toggle
- "Unlock" button
- No other elements — no forgot password, no links, nothing else
- Pressing Enter in the password field triggers unlock (no mouse required)
- Window title: always just "LockBox" — never reveal vault contents in title bar

**Correct Password Behaviour**
- Run full Argon2id derivation (never skip this even if the input looks wrong)
- Decrypt vault into memory
- Transition to main vault UI with a subtle fade-in

**Incorrect Password Behaviour**
- Run full Argon2id derivation (constant time — do not short-circuit)
- Password input border turns red
- Error message below field: "Incorrect password"
- Red border and error message clear as soon as user starts typing again
- NO shake animation
- Increment internal attempt counter (in-memory only, resets on relaunch or successful unlock)

**Lockout Progression**
| Attempts | Behaviour |
|---|---|
| 1–4 | Error shown, retry immediately |
| 5 | 30-second cooldown. Input + button disabled. Countdown: "Too many attempts. Try again in 0:28" |
| 10 | 5-minute cooldown. Same countdown UI |
| 15+ | App closes entirely. Must relaunch. |

**Auto-lock Re-entry**
- When vault auto-locks due to inactivity, return to unlock screen
- Show subtle info message above password field: "LockBox was locked due to inactivity"
- Message disappears as soon as user starts typing

---

### MAIN VAULT UI

**Window Behaviour**
- Window title: always "LockBox" — never anything else
- Top bar spans full width containing:
  - LockBox logo/name (left, non-interactive)
  - Global search icon (opens search overlay)
  - Settings icon (opens settings panel)
  - Lock icon with tooltip "Lock vault" — one click locks immediately, returns to unlock screen

**Two-Column Layout**
- Left panel: Buckets (~240px fixed width)
- Right panel: Entries (remaining width)
- Resizable divider is optional / stretch goal

**Left Panel — Buckets**
- "New Bucket" button at top
- List of buckets, each row shows: colour dot + bucket name
- Selected bucket is highlighted
- Right-click context menu on each bucket:
  - Rename
  - Change colour (preset palette of 8–10 colours, no hex input)
  - Delete (with confirmation dialog — see below)
- Default sort: alphabetical
- Bucket colour options: blue, green, red, amber, purple, teal, coral, pink, gray (use these names, map to Tailwind colours)

**Bucket Delete Confirmation Dialog**
> "Delete [Bucket Name]? This will permanently delete all X entries inside it. This cannot be undone."
- Cancel button and Delete button (red/destructive styling)

**Empty State (no buckets)**
```
No buckets yet.
Create your first bucket to get started.
[+ Create Bucket]
```

**Right Panel — Entries**
- Search bar at top: filters entries within selected bucket by label
- "Add Entry" button below search bar
- Entry cards listed below
- Default sort: alphabetical. Sort dropdown: Alphabetical / Date Added (newest first)

**Entry Card (list view)**
- Icon: 🔑 for API key, 👤 for account (use SVG icons, not emoji in final implementation)
- Entry label (bold)
- Subtitle: entry type + date added
- Actual values NEVER shown on cards — always masked

**Empty State (bucket selected, no entries)**
```
No entries in this bucket.
[+ Add Entry]
```

**Entry Detail Modal**
Opens when clicking an entry card.

*API Key entry:*
- Header: label + edit icon + delete icon
- Bucket name and date added
- API Key field: masked `••••••••••••••••` with reveal (👁) and copy (📋) buttons
- Notes field (read-only in detail view, multi-line)
- Close button

*Account entry:*
- Header: label + edit icon + delete icon
- Bucket name and date added
- Username/Email field: plain text with copy button
- Password field: masked with reveal and copy buttons
- Notes field (read-only in detail view)
- Close button

**Copy Behaviour**
- Copies value to clipboard
- Starts clipboard auto-clear countdown
- Shows brief tooltip/toast: "Copied — clears in 60s" (or configured duration)
- Toast disappears after 3 seconds; clipboard still cleared at the configured time

**Reveal Behaviour**
- Toggles masked ↔ plaintext on click
- Toggles back on second click
- Auto-re-masks if entry detail modal is closed

**Add / Edit Entry Modal**
Type selector at top: "API Key" | "Account"

*API Key fields:*
- Label (text, required)
- Bucket (dropdown, pre-selected to current bucket)
- API Key value (masked input, required)
- Notes (textarea, optional)

*Account fields:*
- Label (text, required)
- Bucket (dropdown, pre-selected to current bucket)
- Username / Email (text, required)
- Password (masked input, required)
- Notes (textarea, optional)

Switching type with filled fields: show brief "Switching type will clear the form. Continue?" confirmation.

**Global Search Overlay**
- Triggered by search icon in top bar
- Command-palette style — full overlay or dropdown
- Searches entry labels across ALL buckets simultaneously
- Never searches entry values
- Results grouped by bucket name
- Clicking a result: navigates to that bucket, opens entry detail modal
- Escape key closes overlay

---

### SETTINGS PANEL

Opens as a slide-in panel or modal from the settings icon.

**Sections:**

*Security*
- Auto-lock timeout: dropdown — 5 min / 15 min / 30 min / 60 min / Never (default: 30 min)
- Lock on minimise: toggle (default: off)
- Change Master Password (see below)

*Clipboard*
- Auto-clear delay: dropdown — 30s / 60s / 90s / Off (default: 60s)

*Backup*
- Current backup path (or "Not configured")
- "Change Location" button → folder picker
- "Backup Now" button → immediately copies vault.dat to backup path
- "Remove Backup" button

*Window*
- Always on top: toggle (default: off)

*About*
- Version number
- Vault file location (click to reveal in Explorer)

**Change Master Password Flow**
1. Modal with three fields: Current Password, New Password, Confirm New Password
2. New password minimum: 4 characters
3. Non-blocking strength indicator on new password field
4. On confirm:
   - Verify current password by attempting Argon2id derivation + decryption
   - If correct: re-encrypt entire vault with new key derived from new password, new salt, new nonce
   - Save new vault.dat atomically (write to temp file, then rename)
   - Show success toast: "Password updated"
5. Warning: same "no recovery" callout as setup

---

### IMPORT FLOW

Accessible via a "Import" button in the settings panel or an empty-state CTA.

**Supported formats:**
1. `.env` files — each `KEY=value` line becomes an API Key entry
2. `.csv` files — column mapping UI (see below)

**CSV Import — Column Mapping UI**
1. User selects a .csv file
2. Show first 3 rows as preview
3. Column mapping dropdowns: map CSV columns to LockBox fields
4. "Label" column (required), "Type" column (optional, defaults to API Key), "Value/Password" column (required), "Username" column (optional), "Notes" column (optional), "Bucket" column (optional)
5. If no "Bucket" column: dropdown to select or create a bucket for all imported entries
6. "Import X entries" confirmation button
7. Show results: "X entries imported successfully. Y entries skipped (missing required fields)."

**.env Import**
1. User selects .env file
2. Parse KEY=VALUE pairs (skip comments starting with #, skip empty lines)
3. Preview list of entries to be imported
4. Bucket selector: which bucket to import into (or create new)
5. Each entry gets: label = KEY, type = api_key, value = VALUE
6. "Import X entries" button

---

## GIT & PROJECT STRUCTURE

### .gitignore (create this at project root in Step 1)
```gitignore
# Tauri build outputs
/src-tauri/target/

# Node / frontend
node_modules/
dist/
.vite/

# Claude Code session files
.claude/
.claude_session/

# Environment / secrets (should never exist but just in case)
.env
.env.local
.env.*.local

# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.idea/
.vscode/settings.json
*.suo
*.user

# Logs
*.log
npm-debug.log*

# Test outputs
/coverage/

# Tauri generated
/src-tauri/WixTools/
/src-tauri/gen/
```

### .claude/ directory setup
Create `.claude/` at project root with:

`.claude/settings.json`:
```json
{
  "project": "LockBox",
  "version": "0.1.0",
  "auto_compact_after_steps": [3, 7, 11],
  "session_limit_threshold": 0.8
}
```

`.claude/AGENT_NOTES.md`:
```markdown
# Agent Notes

## Architecture Decisions
- Argon2id params: m=65536 (64MB), t=3, p=1
- AES-256-GCM with 96-bit nonce, regenerated on every save
- Vault key exists only as Tauri managed state (Arc<Mutex<Option<Vec<u8>>>>)
- config.json is plaintext — never write credentials here
- All encryption/decryption happens in Rust commands, never in JS

## Known Constraints
- Windows only — no macOS/Linux considerations needed
- No network requests permitted — CSP enforced in tauri.conf.json
- Attempt counter is in-memory only — intentionally resets on relaunch
```

---

## PROGRESS.md FORMAT

Create this file at project root in Step 1. Use exactly this format:

```markdown
# LockBox — Build Progress

## Status
Last updated: <timestamp>
Current session: <session number>

## Steps

[DONE] Step 1: Project scaffold, .gitignore, .claude setup, git init
[DONE] Step 2: Tauri + React + TypeScript + Tailwind configured and running
...
[PENDING] Step N: <description>
...

## Session Notes
<Any notes from the current or previous session about decisions made>
```

---

## BUILD STEPS

Work through these steps in order. Do not skip steps. Commit after each.

---

### Step 1 — Project Scaffold & Configuration

- `git init`
- Create `PROGRESS.md` with all steps listed as `[PENDING]`
- Create `.gitignore` (exact content from spec above)
- Create `.claude/settings.json` and `.claude/AGENT_NOTES.md`
- `npm create tauri-app@latest lockbox -- --template react-ts`
- Install dependencies: `cd lockbox && npm install`
- Install Tailwind CSS v3: `npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`
- Configure `tailwind.config.js` for the src directory
- Add Tailwind directives to `src/index.css`
- Add Rust dependencies to `src-tauri/Cargo.toml`:
  ```toml
  argon2 = "0.5"
  aes-gcm = "0.10"
  rand = "0.8"
  serde = { version = "1", features = ["derive"] }
  serde_json = "1"
  uuid = { version = "1", features = ["v4"] }
  zeroize = "1"
  ```
- Configure `tauri.conf.json`:
  - Set `productName` to "LockBox"
  - Set CSP to block all external network requests: `"csp": "default-src 'self'; script-src 'self'; connect-src 'none'"`
  - Configure `allowlist` / `permissions` for: `fs` (scoped to AppData), `dialog` (open/save)
  - Set window title to "LockBox", size 1000x680, min size 800x560
- Verify `npm run tauri dev` starts without errors
- Commit and mark Step 1 done

---

### Step 2 — Rust Core: Vault Data Structures & Crypto Primitives

Create `src-tauri/src/vault.rs`:
- Define all data structs with serde: `VaultEntry` (api_key and account variants), `Bucket`, `VaultData`
- Implement vault file header parsing (version, argon2 params, salt, nonce, ciphertext)
- Implement `derive_key(password: &str, salt: &[u8], params: Argon2Params) -> Result<Vec<u8>>`
  - Uses Argon2id, m=65536, t=3, p=1, output length 32 bytes
- Implement `encrypt_vault(key: &[u8], nonce: &[u8], plaintext: &[u8]) -> Result<Vec<u8>>`
  - AES-256-GCM
- Implement `decrypt_vault(key: &[u8], nonce: &[u8], ciphertext: &[u8]) -> Result<Vec<u8>>`
  - AES-256-GCM
- Implement `write_vault_file(path: &Path, params: ..., salt: &[u8], nonce: &[u8], ciphertext: &[u8]) -> Result<()>`
  - Write atomically: write to `vault.dat.tmp`, then `rename` to `vault.dat`
- Implement `read_vault_file(path: &Path) -> Result<VaultFileContents>`
  - Parse header bytes, return structured result
- Use `zeroize` on all key material after use

Create `src-tauri/src/config.rs`:
- Define `AppConfig` struct with all settings fields and defaults
- Implement `load_config(path: &Path) -> AppConfig` — returns defaults if file missing/malformed
- Implement `save_config(path: &Path, config: &AppConfig) -> Result<()>`

Create `src-tauri/src/state.rs`:
- Define `VaultState`: `Arc<Mutex<Option<Vec<u8>>>>` — holds derived key in memory only
- Define `ConfigState`: `Arc<Mutex<AppConfig>>`

Update `src-tauri/src/main.rs` to register states.

Write unit tests for encrypt/decrypt round-trip. Run `cargo test`.
Commit and mark Step 2 done.

---

### Step 3 — Rust Tauri Commands

Create `src-tauri/src/commands.rs` implementing all Tauri commands:

```rust
// Setup & Auth
vault_exists() -> bool
create_vault(password: String) -> Result<(), String>
unlock_vault(password: String) -> Result<bool, String>  // always runs full argon2id
lock_vault() -> Result<(), String>
change_password(current: String, new_password: String) -> Result<(), String>

// Vault CRUD
get_vault_data() -> Result<VaultData, String>  // returns decrypted vault (no key material)
save_vault_data(data: VaultData) -> Result<(), String>  // re-encrypts and saves

// Config
get_config() -> Result<AppConfig, String>
save_config(config: AppConfig) -> Result<(), String>

// Backup
set_backup_path(path: String) -> Result<(), String>
backup_now() -> Result<(), String>

// Import helpers
parse_env_file(content: String) -> Result<Vec<ParsedEntry>, String>
parse_csv_file(content: String) -> Result<CsvParseResult, String>
```

All commands that require an unlocked vault must check `VaultState` first and return an appropriate error if locked.

Register all commands in `main.rs` via `.invoke_handler(tauri::generate_handler![...])`.

Commit and mark Step 3 done.

> **AUTO-COMPACT CHECKPOINT** — compact context after this step before proceeding.

---

### Step 4 — Frontend: App Shell, Routing, State

Set up React application shell:

- Install: `npm install zustand react-hot-toast lucide-react`
- Create `src/store/vaultStore.ts` using Zustand:
  - State: `appState: 'loading' | 'setup' | 'locked' | 'unlocked'`
  - State: `vaultData: VaultData | null`
  - State: `config: AppConfig | null`
  - State: `selectedBucketId: string | null`
  - Actions: `setAppState`, `setVaultData`, `setConfig`, `selectBucket`, `updateEntry`, `addEntry`, `deleteEntry`, `addBucket`, `deleteBucket`, `updateBucket`
- Create `src/App.tsx`:
  - On mount: call `vault_exists` Tauri command
  - Route to: `<SetupFlow />`, `<UnlockScreen />`, or `<MainVault />` based on state
  - Wrap with `<Toaster />` from react-hot-toast
- Create `src/lib/tauri.ts` — typed wrappers around all `invoke()` calls
- Create `src/lib/clipboard.ts` — clipboard write + auto-clear timer logic
- Create `src/types/vault.ts` — TypeScript interfaces matching Rust structs

Commit and mark Step 4 done.

---

### Step 5 — Setup Flow UI

Create `src/components/setup/`:

- `SetupFlow.tsx` — manages steps A/B/C/D with internal state
- `WelcomeStep.tsx` — logo, tagline, Get Started button
- `CreatePasswordStep.tsx`:
  - Two masked inputs with show/hide toggles
  - Strength indicator (compute in JS: length-based + character variety, 4 levels)
  - Warning callout box (red/amber border, clearly visible)
  - "Create Vault" button — calls `create_vault` Tauri command
  - Loading state while vault is being created (Argon2id takes ~0.5-1s)
- `BackupStep.tsx` — folder picker via Tauri dialog API, skip option
- `CompleteStep.tsx` — success state, vault path display, Open LockBox button

Design requirements:
- Clean, centered card layout
- Progress indicator showing current step (dots or step numbers)
- Smooth transitions between steps
- Consistent with overall app aesthetic

Commit and mark Step 5 done.

---

### Step 6 — Unlock Screen UI

Create `src/components/unlock/UnlockScreen.tsx`:

- Centered card, LockBox logo at top
- Single password input, masked, with show/hide toggle
- "Unlock" button
- Enter key submits
- On incorrect: red border on input, "Incorrect password" message below, clears on typing
- Lockout countdown UI: disabled input, countdown text "Too many attempts. Try again in 0:28"
- Auto-lock message: "LockBox was locked due to inactivity" (info style, clears on type start)
- Attempt counter managed in component state
- Lockout timer logic: 30s at attempt 5, 5min at attempt 10, app close at attempt 15
- Loading state during unlock (full Argon2id always runs)

Commit and mark Step 6 done.

---

### Step 7 — Main Vault Layout & Top Bar

Create `src/components/vault/`:

- `MainVault.tsx` — two-column layout container
- `TopBar.tsx`:
  - LockBox logo/name left
  - Right: GlobalSearchButton, SettingsButton, LockButton
  - LockButton calls `lock_vault` and transitions to locked state
  - Auto-lock timer: reset on any user interaction (mouse move, key press), trigger lock on timeout
  - Lock-on-minimise: listen for window focus events if setting enabled
- `layout/TwoColumnLayout.tsx` — flex layout, fixed left panel width, right panel fills

Auto-lock implementation:
- useEffect with a timer that resets on `mousemove`, `keydown`, `click` events on the document
- Read timeout from config store
- On timeout: call `lock_vault`, transition state to 'locked'

Commit and mark Step 7 done.

> **AUTO-COMPACT CHECKPOINT** — compact context after this step before proceeding.

---

### Step 8 — Bucket Panel

Create `src/components/vault/BucketPanel.tsx`:

- "New Bucket" button at top → opens `CreateBucketModal`
- List of bucket rows
- Selected bucket highlighted
- Right-click context menu: Rename, Change Colour, Delete
  - Use a custom context menu component (not browser default)
- Colour picker: 9 preset colour swatches (blue, green, red, amber, purple, teal, coral, pink, gray)
- Delete: opens `ConfirmDeleteBucketModal` with entry count

Create `src/components/modals/CreateBucketModal.tsx`:
- Name input, colour picker, Create/Cancel

Create `src/components/modals/ConfirmDeleteBucketModal.tsx`:
- Bucket name, entry count, Cancel + Delete (destructive)

All bucket mutations call `save_vault_data` after updating Zustand store.

Commit and mark Step 8 done.

---

### Step 9 — Entry List & Entry Cards

Create `src/components/vault/EntryList.tsx`:

- Receives selected bucket's entries
- Search bar — filters by label (case-insensitive)
- Sort dropdown: Alphabetical / Date Added
- "Add Entry" button
- Maps entries to `EntryCard` components
- Empty state when no entries

Create `src/components/vault/EntryCard.tsx`:

- Key icon (Lucide `Key`) for api_key type
- User icon (Lucide `User`) for account type
- Label (bold)
- Subtitle: type label + formatted date added
- No value shown — masked always
- Click handler opens `EntryDetailModal`
- Hover state

Commit and mark Step 9 done.

---

### Step 10 — Entry Detail & Add/Edit Modals

Create `src/components/modals/EntryDetailModal.tsx`:

- Header with label, edit button, delete button
- Bucket name + date added subtitle
- For api_key: masked value field with reveal toggle (Eye/EyeOff from Lucide) and copy button
- For account: username (plain + copy), password (masked + reveal + copy)
- Notes section (read-only)
- Copy button behaviour: writes to clipboard, starts auto-clear timer, shows toast
- Close button

Create `src/components/modals/AddEditEntryModal.tsx`:

- Type toggle at top: "API Key" | "Account"
- Fields per type (see spec)
- Bucket dropdown pre-selected to current bucket
- Validation: required fields
- Create/Update button calls `save_vault_data`
- Switching type with dirty fields: confirm dialog

Create `src/components/modals/ConfirmDeleteEntryModal.tsx`:
- Entry label, Cancel + Delete

All entry mutations update Zustand store and call `save_vault_data`.

Commit and mark Step 10 done.

---

### Step 11 — Global Search Overlay

Create `src/components/vault/GlobalSearch.tsx`:

- Triggered by search icon in TopBar or Cmd/Ctrl+K shortcut
- Full-screen overlay with search input at top
- Results update as user types (debounced 150ms)
- Results grouped by bucket name
- Each result: entry icon + label + bucket name
- Clicking result: closes overlay, selects bucket, opens entry detail modal
- Escape closes overlay
- Never searches entry values — labels only

Commit and mark Step 11 done.

> **AUTO-COMPACT CHECKPOINT** — compact context after this step before proceeding.

---

### Step 12 — Settings Panel

Create `src/components/settings/SettingsPanel.tsx`:

- Slide-in panel from right (or modal)
- Sections: Security, Clipboard, Backup, Window, About (see spec for all fields)
- All settings read from / saved to config store
- Config mutations call `save_config` Tauri command

Create `src/components/settings/ChangePasswordModal.tsx`:

- Three fields: current password, new password, confirm new password
- Strength indicator on new password (non-blocking)
- Warning callout (same style as setup)
- Calls `change_password` Tauri command
- Success toast on completion

Backup section:
- Display current backup path or "Not configured"
- "Change Location" → Tauri `open` dialog (folder)
- "Backup Now" → calls `backup_now`
- Path stored in config, NOT in vault

Commit and mark Step 12 done.

---

### Step 13 — Import Flow

Create `src/components/import/ImportFlow.tsx`:

**.env import:**
- File picker (Tauri dialog, filter: `.env`)
- Read file content, send to `parse_env_file` Rust command
- Show preview list of KEY=VALUE pairs to be imported
- Bucket selector (existing or create new)
- "Import X entries" button
- Results toast

**CSV import:**
- File picker (filter: `.csv`)
- Read file content, send to `parse_csv_file` Rust command
- Show first 3 rows preview table
- Column mapping UI: dropdowns for Label, Value, Type, Username, Notes, Bucket columns
- Bucket fallback selector if no bucket column
- "Import X entries" button
- Results: "X imported, Y skipped"

Commit and mark Step 13 done.

---

### Step 14 — Polish, Edge Cases & Testing

- Add keyboard navigation throughout (Tab order, Enter to submit, Escape to close modals)
- Ensure all modals have focus trap
- Add loading states to all async operations (unlock, save, import)
- Add error handling for all Tauri command failures (show toast with message)
- Verify vault auto-backup on every save (if backup path configured)
- Verify clipboard clears after configured delay even if modal is closed
- Verify auto-lock timer resets correctly on user activity
- Verify lock-on-minimise works when setting is enabled
- Verify "always on top" Tauri window setting applies immediately when toggled
- Test: create vault → add buckets → add entries → lock → unlock → verify data persists
- Test: import .env and .csv files
- Test: change master password, verify vault decrypts with new password
- Test: backup path copies vault.dat correctly
- Verify zero network requests in browser devtools (no fetch/XHR to external domains)

Commit and mark Step 14 done.

---

### Step 15 — Build & Packaging

- Run `npm run tauri build`
- Verify the `.msi` installer and `.exe` are produced in `src-tauri/target/release/bundle/`
- Test the installed application end-to-end on Windows
- Update `PROGRESS.md` with `[DONE]` for all steps
- Final commit: "LockBox v0.1.0 — build complete"

---

## DESIGN GUIDELINES

**Aesthetic:** Clean, refined, dark-capable utility app. Think 1Password meets a developer tool — functional first, visually calm, nothing decorative that doesn't serve a purpose.

**Colour palette:**
- Background: neutral dark (zinc-900 in dark, zinc-50 in light)
- Surface: zinc-800 / zinc-100
- Border: zinc-700 / zinc-200
- Accent: blue-500 (primary actions)
- Destructive: red-500
- Success: green-500
- Bucket colour dots: use the 9 preset colours mapped to Tailwind's colour scale

**Typography:**
- Font: System font stack (no external font requests) — `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- Body: 14px / 1.5
- Labels: 12px / muted colour
- Headings: 16–18px / 500 weight

**Spacing:** 8px base unit. Consistent padding: 16px for cards, 12px for form fields, 8px for tight elements.

**Motion:** Subtle only — modal fade-in (150ms), panel slide (200ms). No decorative animations.

**Masked values:** Always render as `••••••••••••••••` (16 bullets). Never show actual length.

---

## IMPORTANT REMINDERS FOR EVERY SESSION

1. Read `PROGRESS.md` before writing a single line of code
2. Never write credentials or key material to `config.json` or any log
3. Vault key lives in `VaultState` (Rust/Tauri state) — never crosses to JS
4. Commit after every step, no exceptions
5. Compact context at checkpoints (Steps 3, 7, 11)
6. When approaching session limit: finish current atomic task, commit, write detailed next-steps to `PROGRESS.md`, stop
7. The `.claude/` directory is in `.gitignore` — it will not be committed
8. Zero network requests — if you ever find yourself writing `fetch(` pointing to an external domain, stop and reconsider
