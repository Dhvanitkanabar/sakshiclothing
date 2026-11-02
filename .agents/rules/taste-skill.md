# TASTE SKILL — ANTI-SLOP FRONTEND DIRECTIVE
Enforced across all frontend development, redesigns, and component generation in this workspace.

## 0. BRIEF INFERENCE & DESIGN READ
Before writing or modifying frontend code, always state the one-line Design Read:
`Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <design system / aesthetic family>. Dials: VARIANCE [X] / MOTION [Y] / DENSITY [Z].`

### The Three Dials:
- `DESIGN_VARIANCE`: 1 (Symmetric/Rigid) to 10 (Artsy/Asymmetric). Baseline: 8.
- `MOTION_INTENSITY`: 1 (Static) to 10 (Cinematic GSAP/Physics). Baseline: 6.
- `VISUAL_DENSITY`: 1 (Art Gallery Airy) to 10 (Cockpit Dense). Baseline: 4.

---

## 1. ANTI-DEFAULT DISCIPLINE (BANNED CLICHÉS)
- **NO Generic Fonts:** Plain Inter is banned as the default. Use characterful typography: `Outfit`, `Cabinet Grotesk`, `Satoshi`, `Geist`, `Instrument Serif`, or `Newsreader`.
- **NO 6-Line Headline Walls:** The Hero H1 must NEVER exceed 2-3 lines. Always use wide containers (`max-w-5xl`, `max-w-6xl`, `w-full`) and fluid clamp typography (`clamp(2.75rem, 5vw, 5rem)`).
- **NO AI-Purple/Blue Glows:** No purple button glows, no random floating mesh gradients without purpose. Base colors must be curated neutrals (Zinc, Slate, Stone) with a single locked accent.
- **NO Empty Grid Voids:** In bento grids, use `grid-auto-flow: dense` and mathematically interlocking spans. Zero dead gaps.
- **NO Inverted/Unreadable Contrast:** Button labels and microcopy must have high contrast and perfect legibility in both light and dark surfaces.
- **NO Fake Meta-Labels:** Never output badges like "QUESTION 05", "SECTION 01", or arbitrary decorative pills without functional context.
- **NO Symmetrical Cramping:** Major sections must feel like distinct chapters. Use `py-28 md:py-44` vertical breathing room.
- **NO Partial Code or Placeholders:** Never output `// TODO`, `// ... rest of code`, or skeleton mocks. Every deliverable must be complete, functional, and production-ready.

---

## 2. MOTION & INTERACTION STANDARDS
- Utilize **GSAP ScrollTrigger** (`pin`, `scrub`, `markers: false`) and **Motion** (`motion/react`) for silky physical movement.
- Isolate client-side physics and motion listeners to avoid unnecessary tree re-renders.
- Never bind continuous scroll or pointer movement to React `useState`. Use `useMotionValue`, `useTransform`, or direct GSAP tickers.

---

## 3. INSTALLED TASTE SKILL PACKAGES
All skills from [Taste Skill](https://www.tasteskill.dev/) are installed in `.agents/skills/`:
- `.agents/skills/taste-skill/SKILL.md`: Core v2 anti-slop master engineering system.
- `.agents/skills/gpt-tasteskill/SKILL.md`: Awwwards-level layout variance, wide typography, GSAP ScrollTriggers.
- `.agents/skills/minimalist-skill/SKILL.md`: Pure minimalist, whitespace-driven architecture.
- `.agents/skills/brutalist-skill/SKILL.md`: High-contrast, tactile, raw editorial layouts.
- `.agents/skills/soft-skill/SKILL.md`: Organic, warm, tactile surfaces.
- `.agents/skills/redesign-skill/SKILL.md`: Audit-first upgrade workflow for existing components.
- `.agents/skills/stitch-skill/SKILL.md`: Semantic tokenization and DESIGN.md generation.
- `.agents/skills/brandkit/SKILL.md`: Brand identity decks, palettes, and visual systems.
- `.agents/skills/output-skill/SKILL.md`: Full-output enforcement and pre-flight checklist.
- `.agents/skills/image-to-code-skill/SKILL.md`: High-fidelity image and visual reference translation.
