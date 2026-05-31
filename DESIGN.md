---
name: LockBox
description: Local-first encrypted credential vault for Windows
colors:
  bg-base: "#18181b"
  bg-surface: "#27272a"
  bg-elevated: "#3f3f46"
  bg-interactive: "#52525b"
  border-default: "#52525b"
  border-subtle: "#3f3f46"
  border-strong: "#71717a"
  text-primary: "#f4f4f5"
  text-secondary: "#a1a1aa"
  text-tertiary: "#71717a"
  accent-primary: "#3b82f6"
  accent-primary-hover: "#2563eb"
  accent-focus-ring: "#3b82f6"
  destructive: "#ef4444"
  destructive-hover: "#dc2626"
  entry-api-key: "#60a5fa"
  entry-account: "#c084fc"
  warning-bg: "#451a03"
  warning-border: "#92400e"
  warning-text: "#fcd34d"
typography:
  headline:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "18px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.accent-primary}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-primary-hover}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-ghost-hover:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input-default:
    backgroundColor: "{colors.bg-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
  card-entry:
    backgroundColor: "transparent"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
  card-entry-hover:
    backgroundColor: "{colors.bg-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
---

# Design System: LockBox

## 1. Overview

**Creative North Star: "The Safe Room"**

LockBox is designed to feel like a quiet, secure place — a room you return to that's always exactly as you left it. The interface doesn't announce itself. It asks nothing of your attention beyond the task at hand. When you open it to find a credential, you should feel immediate calm: this is a tool that respects what it's protecting.

The palette is deep graphite — not blue-black or warm charcoal, but the flat, matte dark of slate or gunmetal. Surfaces layer from near-black (#18181b) through three graphite steps to the interactive foreground (#52525b). Blue-500 is the only saturated color and earns its presence only at moments of action: the primary button, focus rings, active states. It's not decoration — it's a signal.

The system explicitly rejects: the glossy gradients and glow effects of "security theater" UI; the cramped, terminal-gray aesthetic of developer-spartan tools; and the corporate-blue corporate password manager look. It also rejects decoration as a substitute for trust.

**Key Characteristics:**
- Deep graphite dark mode — no warm tint, no blue-black, no glassmorphism
- Single saturated accent (blue-500) used only for action and focus
- System font stack — no external font requests, no network
- 14px body, 12px labels; hierarchy through weight contrast not size explosion
- 150ms transitions on interactive elements — smooth, never flashy
- Modals always have focus traps; credentials always masked by default
- Flat surfaces at rest — no ambient shadows in the resting state

## 2. Colors

The palette is built on a single graphite ramp with one deliberate accent.

### Primary
- **Action Blue** (`#3b82f6`): Used exclusively for the primary button, focus rings, active bucket dots, and entry type chips. Never used as a background or decoration.
- **Active Blue** (`#2563eb`): Hover state for all blue-accented interactive elements.

### Neutral
- **Void** (`#18181b`): Base page background. The darkest layer — top bar, sidebar, page chrome.
- **Graphite** (`#27272a`): Primary surface layer. Modal backgrounds, settings panel, card hover state.
- **Slate** (`#3f3f46`): Elevated surface. Input field backgrounds, border-subtle, interactive areas at rest.
- **Ash** (`#52525b`): Interactive neutral. Bucket panel background, default border color, icon backgrounds.
- **Mist** (`#71717a`): Strong border, tertiary text.
- **Silver** (`#a1a1aa`): Secondary text — labels, subtitles, metadata.
- **Frost** (`#f4f4f5`): Primary text. Used on all meaningful content.

### Semantic
- **Danger Red** (`#ef4444`): Destructive button backgrounds, error state borders.
- **Danger Red Active** (`#dc2626`): Hover on destructive actions.
- **API Key Blue** (`#60a5fa`): Entry type icon for API Key entries. Softer than action blue.
- **Account Violet** (`#c084fc`): Entry type icon for Account entries.
- **Warning Amber** (`#fcd34d` on `#451a03`): Lockout cooldown banner and inactivity messages.

### Named Rules
**The One Blue Rule.** Blue is reserved for one role: action and focus. `#3b82f6` does not appear on decorative borders, section headers, or hover backgrounds. Its rarity is its authority — when the user sees blue, they know something can be acted on.

**The Graphite Layering Rule.** Every surface step up in elevation uses exactly one step up the zinc ramp. Don't skip steps or use arbitrary in-between colors. The ramp is: base (#18181b) → surface (#27272a) → elevated (#3f3f46) → interactive (#52525b).

## 3. Typography

**Display/Body/Label Font:** `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

No external font requests. The system font stack renders at native quality on Windows (Segoe UI) — clean, readable, professional. This is a deliberate security and performance decision.

**Character:** The type system leans on weight and size contrast rather than competing typefaces. One family in two weights (400 and 500) across three sizes creates enough hierarchy without visual noise.

### Hierarchy
- **Headline** (500, 18px, 1.4): Modal titles, section headings. Used sparingly — one per screen.
- **Title** (500, 16px, 1.4): Panel section titles, bucket names when prominent.
- **Body** (400, 14px, 1.5): Entry labels, field labels, settings descriptions, primary content.
- **Label** (400, 12px, 1.4): Subtitles, metadata, dates, secondary context. Max 65ch line length.

### Named Rules
**The Weight-Not-Size Rule.** Hierarchy is communicated by changing weight (400 → 500) before changing size. Don't reach for a larger font size when 500 weight at 14px will establish the hierarchy.

**The No-External-Fonts Rule.** No Google Fonts, no Typekit, no CDN font imports. System fonts only. Every external request is a potential leak vector in a security tool.

## 4. Elevation

LockBox uses **tonal layering**, not shadows. Depth is communicated by stepping up the graphite ramp, not by adding drop shadows. The exception is a single ambient shadow on floating modals to separate them from the background without obscuring the underlying surface.

Surfaces are flat at rest. Shadows appear only when an element genuinely floats above the document (modals, dropdowns, context menus). Hover states use background color change, not shadow.

### Shadow Vocabulary
- **Modal float** (`0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.2)`): Used on modal dialogs and the settings panel only. Signals "this is detached from the page".
- **Context menu** (`0 4px 16px rgba(0,0,0,0.3)`): Bucket right-click context menu. Lighter than modals.

### Named Rules
**The Flat-By-Default Rule.** Nothing casts a shadow at rest. Hover states use `bg-zinc-800` background fill, not `box-shadow`. Shadows are reserved for genuinely floating surfaces.

## 5. Components

### Buttons
Buttons are slightly rounded and compact. They don't take up unnecessary space — this is a utility tool, not a marketing site.

- **Shape:** Gently curved (6px radius)
- **Primary:** Blue-500 background (#3b82f6), Frost text (#f4f4f5), 8px/16px padding. 150ms background transition.
- **Hover:** Blue-600 (#2563eb). No scale change.
- **Focus:** 2px `ring-blue-500` with 2px offset. Always visible — keyboard nav is a first-class citizen.
- **Ghost / Subtle:** Transparent background at rest, Graphite (#27272a) on hover. Silver text (#a1a1aa) at rest, Frost (#f4f4f5) on hover. Used for icon toolbar buttons and secondary actions.
- **Destructive:** Red-500 (#ef4444) background. Red-600 on hover. Used for delete confirmations only.
- **Disabled:** 50% opacity, pointer-events-none. No special background.

### Inputs / Fields
- **Style:** Slate background (#3f3f46), 1px Ash border (#52525b), 6px radius, Frost text, 8px/12px padding.
- **Focus:** Border shifts to Action Blue (#3b82f6), `ring-2 ring-blue-500 ring-offset-0`. Background unchanged.
- **Placeholder:** Silver (#a1a1aa). Meets 4.5:1 contrast against Slate background.
- **Error:** Border shifts to Danger Red (#ef4444). No background change.
- **Password field:** Always includes show/hide toggle (Eye/EyeOff icon, 16px, ghost button style).

### Entry Cards
Entry cards in the vault list are minimally styled to keep the credential list scannable.

- **Rest:** Transparent background, 8px radius, 10px/12px padding, full-width.
- **Hover:** Graphite background (#27272a). 150ms background transition.
- **Icon:** 16px Lucide icon — blue-400 for API Key, purple-400 for Account. Always visible, never hidden.
- **Label:** Body weight 500 (14px), Frost text, truncated at 1 line with ellipsis.
- **Subtitle:** 12px Label, Silver (#a1a1aa). Format: "API Key · YYYY-MM-DD".
- **No nested cards.** Entry cards are flat — no borders, no box shadows.

### Modals
Modals are the primary interaction surface for viewing, editing, and confirming vault operations.

- **Backdrop:** `rgba(0,0,0,0.6)` full-screen overlay. Not glass — flat dark.
- **Container:** Graphite (#27272a) background, 8px radius, Modal float shadow, max-w-md, 24px padding.
- **Header:** Headline weight (500, 18px) title. Close button top-right (ghost icon button).
- **Footer:** Right-aligned button group. Destructive/confirm actions on the right, cancel on the left.
- **Animation:** 150ms fade-in on backdrop, 150ms scale(0.97→1.0) on container. No bounce.
- **Focus trap:** Always active. First focusable element receives focus on open. Escape closes.

### Bucket Panel (Sidebar)
- **Width:** 240px fixed.
- **Background:** Ash (#52525b) — one step above the bg-base to visually separate from the entry list.
- **Bucket rows:** 10px/12px padding, full-width, body-sized text.
- **Color dot:** 8px circle, rounded-full, left of label. The 9 named bucket colors.
- **Active bucket:** Graphite (#27272a) background, Frost text.
- **Hover:** Subtle lightening (bg-zinc-700).
- **Context menu:** Slate (#3f3f46) background, 4px radius, Context menu shadow. Opens at cursor position fixed-positioned.

### Top Bar
- **Height:** 40px.
- **Background:** Void (#18181b) — matches base background, creating a seamless header.
- **Border:** 1px Graphite (#27272a) bottom border.
- **Branding:** 14px semibold, Frost text. Emoji lock + "LockBox".
- **Toolbar icons:** 16px Lucide icons, ghost button style (6px padding). Silver at rest, Frost on hover.

### Masked Values (Entry Detail)
Credentials are always shown as 16 bullet characters (`••••••••••••••••`) regardless of actual length. This prevents length leakage and is a deliberate design choice, not a technical limitation.

- **Reveal toggle:** Eye icon button, ghost style, inline with the value.
- **Copy button:** Ghost icon button. On click: toast "Copied — clears in Xs", auto-clear timer starts.
- **The 16-bullet mask is fixed width** — it does not vary with the actual credential length.

## 6. Do's and Don'ts

### Do:
- **Do** use the graphite ramp sequentially: base → surface → elevated → interactive. Never skip or invent intermediate steps.
- **Do** reserve Action Blue (#3b82f6) for interactive elements only: primary buttons, focus rings, active states, entry type icons.
- **Do** always show credential values as 16 bullets by default. Reveal is an intentional, per-field action.
- **Do** apply 150ms transitions on `background-color`, `color`, and `opacity` for all interactive state changes.
- **Do** trap focus in every modal. First focusable element receives focus on open. Escape always closes.
- **Do** use `ring-2 ring-blue-500` focus rings on all keyboard-navigable elements — never style out focus indicators.
- **Do** keep the type scale tight: headline (18px/500) → body (14px/400) → label (12px/400). Hierarchy through weight before size.
- **Do** use `position: fixed` for context menus and dropdowns — never `position: absolute` inside overflow containers.

### Don't:
- **Don't** use gradient text (`background-clip: text`). Ever.
- **Don't** use glassmorphism (backdrop-filter + opacity overlays as a design choice). The security context makes it feel fraudulent.
- **Don't** use border-left or border-right greater than 1px as a colored accent stripe. No side-stripe callouts.
- **Don't** add drop shadows to resting surfaces. Shadows are for floating elements (modals, context menus) only.
- **Don't** import external fonts. The system font stack is a security constraint and a design decision.
- **Don't** vary the credential mask length with actual value length. Always 16 bullets.
- **Don't** use blue (#3b82f6) for decorative purposes — section headers, badges, background tints. Blue = action.
- **Don't** use the corporate-blue credential manager aesthetic (LastPass-style bright UI, heavy color branding, bubbly rounded components).
- **Don't** use motion-heavy entrances or parallax effects. Transitions are for state changes only. No scroll choreography.
- **Don't** show any credential value by default on any surface. Masked first, always.
