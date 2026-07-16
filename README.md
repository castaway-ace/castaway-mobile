# Castaway

A Spotify-style music streaming app for iOS and Android. Browse a catalog of
artists, albums, and playlists, search across everything, build a personal
library, and stream tracks with a full-featured player — background playback,
crossfade, a swipe-up now-playing modal, and album-art-driven dynamic
backgrounds.

The app is the mobile client for the Castaway backend; it talks to a REST API
(`EXPO_PUBLIC_API_URL`) whose OpenAPI schema lives in [`api/schema.yaml`](api/schema.yaml)
and drives the generated TypeScript types.

## Features

- **Authentication** — email/password login and signup with JWT stored in the device secure store.
- **Home / Search / Library** — three primary tabs, each with its own navigation stack for artist, album, and playlist detail pages.
- **Playback** — streaming audio with background playback, lock-screen controls, and crossfade between tracks.
- **Now Playing** — a swipe-up player modal with dynamic backgrounds extracted from album art.
- **Library & interactions** — like tracks, manage playlists (add/remove tracks), and see them reflected across the app.
- **Theming** — automatic light/dark mode.

## Tech stack

| Area             | Tools                                                                                                                                                      |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | [Expo](https://expo.dev) SDK 56, [React Native](https://reactnative.dev) 0.85 (New Architecture), React 19                                                 |
| Language         | TypeScript                                                                                                                                                 |
| Routing          | [Expo Router](https://docs.expo.dev/router/introduction/) (file-based, typed routes)                                                                       |
| Server state     | [TanStack Query](https://tanstack.com/query) + [axios](https://axios-http.com)                                                                             |
| Validation       | [Zod](https://zod.dev)                                                                                                                                     |
| Audio            | [`expo-audio`](https://docs.expo.dev/versions/latest/sdk/audio/) (background playback)                                                                     |
| Animation        | [Reanimated 4](https://docs.swmansion.com/react-native-reanimated/) + `react-native-worklets`, `react-native-gesture-handler`                              |
| Color extraction | `react-native-image-colors`                                                                                                                                |
| Secure storage   | `expo-secure-store`, `jwt-decode`                                                                                                                          |
| API types        | [`openapi-typescript`](https://openapi-ts.dev) (generated from the backend OpenAPI schema)                                                                 |
| Testing          | [Jest](https://jestjs.io) + `jest-expo` + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) + `axios-mock-adapter` |
| Tooling          | ESLint (`eslint-config-expo`), [Bun](https://bun.sh) package manager, EAS Build                                                                            |

## Project structure

```
app/          Expo Router routes — (auth) and (tabs)/{home,search,library}
api/          Per-domain API clients, TanStack Query hooks, and generated schema types
components/   UI grouped by role: ui / navigation / player / sheets / media / pages
contexts/     App-wide providers (auth, audio player, theme, modals, toasts)
constants/    Theme, query, validation, and API config
utils/        Formatters, hooks, and helpers
test-utils/   Shared testing helpers
```

## Getting started

### Prerequisites

- [Bun](https://bun.sh) (package manager)
- Xcode (iOS) and/or Android Studio (Android) — this app uses a custom **dev client**, not Expo Go
- A running instance of the Castaway backend API

### Setup

1. Install dependencies:

   ```bash
   bun install
   ```

2. Create a `.env` file pointing at your API:

   ```bash
   EXPO_PUBLIC_API_URL="https://api.example.com"
   ```

3. Build and launch the native dev client on a simulator/device:

   ```bash
   bun run ios       # iOS
   bun run android   # Android
   ```

   The first run compiles the native project; subsequent starts can use:

   ```bash
   bun run start     # start the Metro dev server
   ```

## Scripts

| Command                           | Description                                         |
| --------------------------------- | --------------------------------------------------- |
| `bun run start`                   | Start the Expo dev server                           |
| `bun run ios` / `bun run android` | Build and run the native dev client                 |
| `bun run lint`                    | Lint with ESLint (Expo config)                      |
| `bun run test`                    | Run the Jest test suite                             |
| `bun run test:watch`              | Run tests in watch mode                             |
| `bun run test:coverage`           | Run tests with a coverage report                    |
| `bun run generate:types`          | Regenerate `api/schema.d.ts` from `api/schema.yaml` |

## Testing

Tests use `jest-expo` with React Native Testing Library and mock the network
layer with `axios-mock-adapter`. Run the full suite with:

```bash
bun run test
```

## Building

Native builds are produced with [EAS Build](https://docs.expo.dev/build/introduction/)
using the profiles in [`eas.json`](eas.json) (`development`, `preview`,
`production`).
