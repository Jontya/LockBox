# Product

## Register

product

## Users

Developers and engineers managing API keys, tokens, and account credentials across multiple projects. They're technically proficient, privacy-conscious, and skeptical of cloud-synced password managers. They use this on a personal Windows machine where they want full control and zero third-party exposure.

## Product Purpose

LockBox is a fully offline, local-first encrypted credential vault for Windows. It stores API keys and account credentials encrypted on disk using AES-256-GCM with Argon2id key derivation. No cloud. No network. No trust required. Success means a developer can store and retrieve sensitive credentials in under 5 seconds with confidence nothing leaves their machine.

## Brand Personality

Calm, trustworthy, polished. The tool should feel like it was made by someone who takes security seriously but also values craftsmanship. Not austere or cold — quietly confident. It respects the user's intelligence without being spartan.

## Anti-references

- Generic SaaS credential managers (LastPass, corporate-blue UI)
- Loud gradient / glassmorphism "security" aesthetics
- Overly minimal terminal-config-tool look with zero visual craft

## Design Principles

1. **Trust through restraint** — every UI element should feel considered and deliberate, never decorative. Decoration erodes trust in a security tool.
2. **Low cognitive load at the entry point** — the unlock screen is the most-used surface; it must be instant, calm, and distraction-free.
3. **Values always masked** — credential values are never shown by default. Reveal is an intentional action, not the default state.
4. **Feedback without alarm** — errors and warnings should be precise and calm, never threatening or dramatic.
5. **Desktop-native feel** — window chrome, keyboard nav, and interaction patterns should feel like a real desktop app, not a web page that happens to be in a frame.

## Accessibility & Inclusion

WCAG AA minimum. Full keyboard navigation for all vault operations. Focus traps in all modals. Escape to close. No reliance on color alone to convey state.
