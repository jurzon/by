# Emoji Reference for Documentation

This file centralizes all emoji usage for the BY project. If you ever see `??` or solitary `?` instead of an emoji, refer to the Troubleshooting section below and restore from this canonical list.

## Core Section Emojis
- ?? Headers / Vision / Quick Start
- ?? Prerequisites / Requirements
- ? Fast path / Quick actions
- ?? API & Web endpoints
- ? Health checks / Success states
- ??? Tools (pgAdmin, dev utilities)
- ?? PostgreSQL
- ?? Redis / Caching
- ?? Development commands / Local environment
- ?? Architecture overview / Analytics summary
- ??? Database concepts / Storage
- ?? Testing
- ?? Monitoring / Metrics / Growth
- ?? Environment variables / Configuration
- ?? Security / Authentication / Authorization
- ?? Troubleshooting notices
- ?? Resources / Documentation links
- ?? Development workflow / Tips
- ?? Closing call to action / Goals

## App-Specific Emojis
- ?? Mobile App (React Native + Expo)
- ?? Standard User
- ?? Admin User
- ?? Payments / Financial Stakes
- ?? Goals & Targeting
- ? Successful Check-in / Completed
- ? Missed / Failed Check-in
- ?? Refresh / Reload / Retry
- ?? Physical Device Testing
- ?? iOS
- ?? Android (Alt: ??)

## Status & Process Emojis
- ?? Active / Good (fallback ? if circle unsupported)
- ?? Error / Failure
- ?? Pending / Warning / Neutral wait (fallback ??)
- ?? Timing / Duration / Pending execution
- ?? Search / Inspect / Investigate
- ?? Notes / Documentation / Draft
- ??? Architecture / System design
- ?? UI / Design / Styling
- ?? Security / AuthN / AuthZ
- ?? Stripe / Payment processing

## Development Workflow Emojis
- ?? Critical issue / Urgent failure
- ?? Help / Support needed
- ?? Tip / Insight / Optimization
- ?? Checklist / Steps / Tasks
- ?? Configure / Adjust / Patch
- ?? Getting Started / Run sequence
- ?? Metrics / Analytics / Reporting
- ?? Success / Completed milestone
- ? New Feature / Enhancement / Polishing

---
## Troubleshooting Emoji Corruption (`??` or `?`)
If emojis suddenly display as `??` or `?` on the same machine where they worked before, the issue is almost always environmental—not the repository content itself.

### 1. Encoding Issues (Most Common)
Windows terminals or editors may open the file with a legacy code page.
- Ensure the file is saved as UTF-8 (no BOM required, but acceptable)
- In VS Code: Check status bar ? should show `UTF-8` ? if not, Convert to UTF-8 and re-save
- Git should NOT alter encoding—verify with: `git show HEAD:Docs/correct_emoji.md | file -` (Linux/macOS) or open in VS Code Raw view

### 2. Terminal Code Page (Windows)
If viewing via PowerShell / CMD:
```powershell
chcp 65001   # Switch to UTF-8 code page
$OutputEncoding = [Console]::OutputEncoding = [Text.UTF8Encoding]::UTF8
```
Older consoles may not render emojis ? prefer Windows Terminal.

### 3. Font Fallback
The editor font may not support colored glyphs.
- Use a modern font: Segoe UI Emoji (Windows), Apple Color Emoji (macOS), Noto Color Emoji (Linux)
- In VS Code: Settings ? Editor: Font Family ? include a fallback: `"Cascadia Code, Segoe UI Emoji"`

### 4. Remote Copy/Paste Stripping
Copying through SSH / RDP / browser-based terminals may degrade surrogate pairs.
- Always edit this file locally where emoji support is confirmed
- Avoid copying from markdown rendered in browsers that might substitute SVG or images

### 5. Git Auto-Conversion / Tools
Some scripts or formatters can sanitize non-BMP characters.
- Avoid tooling that rewrites Unicode (legacy linters / CI filters)
- Disable unsafe filters: `git config --global core.autocrlf true` is fine; this does NOT affect Unicode

### 6. Mixed File Origins
Make sure you are editing the canonical file at: `Docs/correct_emoji.md` and not a temp or duplicated copy (e.g. `BY-Mobile/Docs/...`).

### 7. Web Preview Sanitization
Some terminals / minimal browsers / PDF exports drop emoji. Always validate inside VS Code source view or GitHub web interface diff.

### 8. Accidental Replacement With Fallback Characters
Global search/replace (e.g. replacing unusual bytes) can sometimes wipe emojis. Undo or restore from Git history:
```bash
git checkout HEAD -- Docs/correct_emoji.md
```

---
## Copilot / Automation Guidance
When modifying documentation:
1. Never replace listed emojis with ASCII equivalents.
2. If an emoji appears corrupted in the working copy, DO NOT commit—open raw version on GitHub to confirm.
3. For new sections, choose from existing categories before introducing new emojis.
4. Only add new emojis after updating this canonical file.
5. Prefer widely-supported base emoji (no complex Zero Width Joiner sequences or skin tone modifiers) unless necessary.
6. Never duplicate this file—always reference this single source.
7. If upgrading Expo or tooling, re-verify emoji rendering in web (Chrome + Firefox) and mobile (Expo web + device).
8. For programmatic insertion, ensure process writes UTF-8: Node example:
```js
fs.writeFileSync('Docs/correct_emoji.md', content, 'utf8');
```
9. Avoid Windows Notepad pre-2019 (it may mishandle some code points).
10. Treat any occurrence of `??` as a red flag requiring manual inspection.

---
## Quick Restoration Procedure
If corruption detected:
1. Discard local changes to this file if unsure: `git restore Docs/correct_emoji.md`
2. Re-open with UTF-8 enforced
3. Copy canonical block from latest main branch
4. Commit with message: `docs: restore emoji mapping (UTF-8 fix)`

---
## Verification Checklist (Before Commit)
- [ ] File encoding UTF-8
- [ ] No `??` or stray `?` placeholders
- [ ] Emojis match canonical mapping
- [ ] No added skin tone variations unless intentional
- [ ] Rendered correctly in VS Code + GitHub diff

---
**Source of Truth Established:** Use this file for all emoji policy decisions across README, onboarding, and UI copy.