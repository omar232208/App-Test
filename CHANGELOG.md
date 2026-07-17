# Changelog

All notable changes to DevOS are documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-07-16

### Added
- **Onboarding** — 3-slide animated welcome screen with ScrollView pagination
- **Authentication** — Email/password login and registration with AsyncStorage persistence
- **Dashboard** — Productivity score ring, stats overview, quick actions, active projects feed, activity timeline
- **Projects** — Full CRUD project management: create, update, delete, color labels, status tracking
- **Tasks** — Per-project task list with priority levels (low / medium / high / urgent) and done/todo toggle
- **AI Chat** — Conversational AI interface with keyword-matched responses, typing indicator, suggestion chips
- **Notes** — Create, edit, delete, pin, and search markdown notes with color labels
- **Profile** — User stats, settings sections, theme controls, account management, sign out
- **Design System** — AMOLED dark palette, indigo/violet gradients, glassmorphism BlurView cards
- **Navigation** — Expo Router v6 file-based routing; NativeTabs (iOS 26+) with classic tab bar fallback
- **Animations** — React Native Reanimated 4 throughout — press scale, entrance fade/slide, progress rings
- **Monorepo** — pnpm workspace setup with `@workspace/mobile` and `@workspace/api-server` packages

### Technical
- Expo SDK 53, React Native 0.79
- TypeScript strict mode
- `expo-blur`, `expo-linear-gradient`, `expo-haptics` for premium feel
- `react-native-svg` + Reanimated for animated ProgressRing component
- Safe area handling via `react-native-safe-area-context`
- Inter font family via `@expo-google-fonts/inter`

---

## Roadmap

### [1.1.0] — Planned
- [ ] Supabase backend — real auth, PostgreSQL, Row Level Security
- [ ] Google & GitHub OAuth login
- [ ] Forgot password / reset password flow
- [ ] Email verification
- [ ] Real-time project collaboration
- [ ] Push notifications
- [ ] EAS Build + App Store / Play Store release

### [1.2.0] — Planned
- [ ] AI integration with real LLM (OpenAI / Anthropic)
- [ ] Code editor component with syntax highlighting
- [ ] Git repository linking
- [ ] Team workspaces
- [ ] Analytics dashboard with charts

### [2.0.0] — Planned
- [ ] Offline-first sync engine
- [ ] End-to-end encryption for notes
- [ ] Plugin system
- [ ] Custom themes marketplace
