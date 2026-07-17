# Contributing to DevOS

Thank you for your interest in contributing to DevOS! 🎉

## Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/omar232208/App-DevOS/issues) first.
2. Open a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Device/OS/Expo version info

### Suggesting Features

Open a [feature request](https://github.com/omar232208/App-DevOS/issues/new) with:
- Problem being solved
- Proposed solution
- Any alternatives considered

### Pull Requests

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Install** dependencies:
   ```bash
   pnpm install
   ```

3. **Make** your changes following the coding standards below.

4. **Test** your changes on both iOS and Android (via Expo Go).

5. **Commit** using conventional commits:
   ```
   feat: add dark mode toggle
   fix: resolve login button overflow on small screens
   docs: update README setup guide
   chore: upgrade expo-router to v6
   ```

6. **Push** and open a Pull Request with:
   - Clear description of changes
   - Screenshots/recordings if UI changes
   - Test steps

## Coding Standards

### TypeScript
- Strict mode enabled — no `any` types
- All props must be typed with interfaces
- Export types from a central `types/` directory

### Components
- Use functional components with hooks
- One component per file
- Use `StyleSheet.create()` for all styles — no inline styles except dynamic values

### Naming
- Components: `PascalCase`
- Hooks: `camelCase` prefixed with `use`
- Files: `camelCase.tsx` for components, `camelCase.ts` for utilities
- Constants: `SCREAMING_SNAKE_CASE`

### Design System
- Always use `useColors()` hook — never hardcode color values
- Use spacing from `constants/spacing.ts`
- Prefer `LinearGradient` over flat colors for interactive elements

### Performance
- Wrap expensive components in `React.memo`
- Use `useCallback` for event handlers passed as props
- Use `useMemo` for derived data
- Use `FlatList` / `FlashList` for long lists — never `ScrollView` for dynamic lists

## Development Setup

```bash
# Clone
git clone https://github.com/omar232208/App-DevOS.git && cd App-DevOS

# Install
pnpm install

# Copy env
cp artifacts/mobile/.env.example artifacts/mobile/.env.local
# Fill in EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY

# Start
pnpm --filter @workspace/mobile run dev
```

## Commit Conventions

We follow [Conventional Commits](https://www.conventionalcommits.org/):

| Type | When |
|------|------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no logic change) |
| `refactor` | Refactor (no feature/fix) |
| `perf` | Performance improvement |
| `test` | Tests |
| `chore` | Build/tooling updates |

## License

By contributing, you agree your contributions are licensed under the [MIT License](LICENSE).
