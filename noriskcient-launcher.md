# NoRisk Client Launcher – Implementation Notes

## Overview

This document tracks architectural conventions, UX constraints, and major feature work inside the NoRisk Client Launcher frontend (`src/**`) plus the Tauri backend (`src-tauri/**`). The launcher is a React + Zustand SPA bundled through Vite and embedded in a Tauri shell. State that needs to survive restarts is either stored in:

- `launcher-config.json` managed via the `get_launcher_config`/`set_launcher_config` commands (see `src-tauri/src/state/config_state.rs` and generated typings in `src/types/launcherConfig.ts`).
- Client-side persistence stores implemented with `zustand/middleware/persist` (e.g., theme settings, version selection, and the new pinned profile feature described below).

## Feature Log

### November 26 2025 – Pinned Profiles Quick Access

- **Context menu action:** Both `ProfileContextMenu` (legacy cards) and `SettingsContextMenu` (V2 cards) now expose a toggle labeled `Pin Profile` / `Unpin Profile`. The action stores the profile ID inside the `usePinnedProfilesStore`.
- **Persistence:** Pins are written to `localStorage` via the Zustand store name `pinned-profiles-storage`. Missing IDs are pruned automatically once the profile list refreshes.
- **Play tab UI:** The new `PinnedProfilesQuickAccess` component renders a horizontally scrollable quick access rail above the launch controls. Cards are sorted alphabetically, highlight the currently selected profile, and mirror the same filters used by the default profile feed (currently all available profiles). Selecting a card updates both `useProfileStore.selectedProfile` and the launch button’s `useVersionSelectionStore`.
- **Removal affordances:** Each quick access card exposes an inline unpin button so that users can manage pins without leaving the Play tab. Toast notifications acknowledge every pin/unpin action according to the global toaster guidelines.

## Data / Schema Notes

The launcher does not use a traditional database. Persistent data lives in the following layers:

| Source | Format | Description |
| --- | --- | --- |
| `launcher-config.json` (managed by Tauri state) | JSON | Stores global launcher settings (`LauncherConfig`) such as memory defaults, hooks, and grouping preferences. |
| Profile definitions | JSON files handled by the backend via commands like `get_all_profiles_and_last_played`. Each profile conforms to `Profile` (`src/types/profile.ts`). |
| Zustand persistent stores | `localStorage` entries (e.g., `version-selection-storage`, `norisk-theme-storage`, `pinned-profiles-storage`). These hold purely client-side UX state and can be cleared safely. |

There is currently no SQL or document database; the schema obligations are therefore limited to maintaining the TypeScript definitions that mirror the serialized Rust structs. When new persisted fields are added in Rust, update the generated typings and document the addition here for traceability.



