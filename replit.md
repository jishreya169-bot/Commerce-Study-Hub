# VidyaPath LMS

A mobile learning management system for Class 11–12 Commerce students in India, built with Expo/React Native.

## Run & Operate

- `pnpm --filter @workspace/mobile run dev` — run the Expo dev server
- Required env: `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, Expo Router (file-based routing)
- Fonts: @expo-google-fonts/poppins
- Data: @tanstack/react-query + AsyncStorage for local persistence
- Animation: react-native-reanimated (skeleton shimmer)

## Where things live

```
artifacts/mobile/
├── app/
│   ├── (tabs)/          # Home, Courses, Live, Tests, Profile
│   ├── course/[id].tsx  # Course detail with chapter list
│   ├── lecture/[id].tsx # Router → live-session or recorded
│   ├── live/[id].tsx    # Router → live-session or recorded
│   ├── live-session/[id].tsx  # Live class with real-time chat + reactions
│   ├── recorded/[id].tsx      # Recorded lecture with Comments/Notes/Info tabs
│   ├── doubts.tsx             # Doubt forum (ask, upvote, answers)
│   └── notes.tsx              # Personal notes (create, edit, delete, color)
├── components/
│   ├── Skeleton.tsx     # Shimmer loading skeletons
│   ├── CourseCard.tsx   # Full + compact course card
│   ├── LiveClassCard.tsx
│   ├── TestCard.tsx
│   ├── StatCard.tsx
│   └── SubjectChip.tsx
├── context/
│   ├── AppContext.tsx   # All app data + mutations
│   └── ThemeContext.tsx # Light/dark toggle (default: light)
├── constants/colors.ts  # Soft blue palette (primary: #5B9BD5)
└── hooks/useColors.ts   # Returns palette for current theme
```

## Architecture decisions

- **Routing pattern**: `lecture/[id]` and `live/[id]` are lightweight routers that dispatch to either `live-session/[id]` or `recorded/[id]` based on the chapter/class state. This keeps each screen focused.
- **Default light mode**: ThemeContext loads `"light"` as default, reads from AsyncStorage on mount. System color scheme is ignored.
- **Skeleton loading**: Each tab screen has a simulated 800–1200ms load delay that shows shimmer skeletons, giving the feel of real data fetching.
- **Soft color palette**: Primary `#5B9BD5` (calm blue), background `#F8FAFC` — chosen for eye comfort during long study sessions.
- **Subject color coding**: Accountancy=#5B9BD5, Business Studies=#7B8EBF, Economics=#5BAD9B, Mathematics=#9B7BC4, English=#BF7B5B.

## Product

- **Home**: Stats, quick actions (Doubts/Notes/Live/Tests), live banner, continue learning, recent recordings, upcoming classes.
- **Courses**: Enrolled vs Explore toggle, subject filter chips, search, full course cards.
- **Live**: Live & Upcoming / Recordings tabs. Hero card for active live class. Joins `live-session/` screen.
- **Live Session**: Dark stream UI, simulated chat, participant list, emoji reactions, raise hand.
- **Recorded**: Simulated video player with progress, Comments tab (like/post), Notes tab (save to personal notes), Info tab (mark complete).
- **Tests**: Summary stats (Total/Done/Pending), difficulty badges, score percentages.
- **Doubts**: Forum with upvoting, expert answers, open/resolved/mine tabs, post modal with subject picker.
- **Notes**: Color-coded note cards, full-screen editor, subject filter, search.
- **Profile**: Dark mode toggle, achievements grid, CBSE badge.

## User preferences

- Primary color: soft calm blue (#5B9BD5) — not harsh, easy on eyes
- Default theme: light mode (user can toggle dark from Profile)
- Target audience: Class 11–12 Commerce, CBSE India
- Languages: Hindi + English (toggle in Profile)
- No high-saturation or jarring colors anywhere

## Gotchas

- After adding new files/directories, Metro needs a workflow restart to detect them (cache issue).
- `lecture/[id]` requires both `id` (chapter id) and `courseId` query params.
- `recorded/[id]` accepts optional `?courseId=&chapterId=` for mark-complete functionality.
- AsyncStorage keys: `app_theme`, `language`, `courses`, `tests`, `doubts`, `notes`, `comments`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `expo` skill for Expo-specific patterns
