# Horse Racing Game Trial Day

Horse Racing Game Trial Day is an interactive front-end project developed using Vue.js. The game simulates a virtual horse racing event with dynamic animations, randomized participants, and state-managed gameplay. The purpose of this project is to demonstrate proficiency in component-based architecture, clean code practices, and effective state management using Pinia.

## Features

- **Dynamic Horse Generation**: Creates 20 unique horses with randomized conditions
- **Race Scheduling**: Automatic generation of 6 round racing schedules
- **Real-time Animation**: Smooth race animations using RequestAnimationFrame
- **State Management**: Centralized state using Pinia stores
- **Modular Architecture**: Feature-based module organization
- **TypeScript Ready**: Full TypeScript support with type definitions

## Technologies

- **Vue 3.5+** - Progressive JavaScript framework
- **Pinia** - Official Vue.js state management
- **TypeScript** - Type-safe development
- **Vite 5** - Next-generation frontend tooling
- **ESLint** - Code linting with Vue 3 rules
- **Playwright** - E2E testing
- **Vitest** - Unit testing framework
- **Vuetify** - Material Design UI library

## Project Setup

```sh
pnpm install
```

### Compile and Hot-Reload for Development

```sh
pnpm dev
```

### Type-Check, Compile and Minify for Production

```sh
pnpm build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
pnpm test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
pnpm exec playwright install
# Or
npx playwright install

# When testing on CI, must build the project first
pnpm build

# Runs the end-to-end tests
pnpm test:e2e
# Runs the tests only on Chromium
pnpm test:e2e --project=chromium
# Runs the tests of a specific file
pnpm test:e2e tests/example.spec.ts
# Runs the tests in debug mode
pnpm test:e2e --debug
```

### Lint with [ESLint](https://eslint.org/)

```sh
pnpm lint
```

## 📁 Project Structure

```
horse-race/
├── src/
│   ├── core/                    # Core functionality
│   │   ├── components/         # Base UI components
│   │   │   ├── __tests__/      # Tests for components
│   │   ├── composables/        # Shared composables
│   │   ├── types/             # TypeScript definitions
│   │   └── utils/             # Utility functions
│   │
│   ├── modules/                # Feature modules
│   ├── layouts/               # Page layouts
│   ├── assets/                # Static assets
│   ├── App.vue               # Root component
│   └── main.ts               # Application entry
│
├── e2e/ # End-to-end tests
├── public/                    # Public static files
├── .vscode/                   # VS Code settings
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript config
├── package.json              # Dependencies
└── README.md                 # You are here!
```
