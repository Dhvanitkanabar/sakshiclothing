# AGENTS.md — Sakshi Clothing Frontend & Taste Directives

Welcome, AI Agent. This codebase adheres strictly to the **Taste Skill** anti-slop frontend engineering standards (from [Taste Skill](https://www.tasteskill.dev/)).

## 1. Quick Start & Skill Access
Skills are stored in `.agents/skills/`:
- `taste-skill`: The primary anti-slop frontend design framework.
- `gpt-tasteskill`: Advanced Awwwards-level GSAP motion & wide layout variance.
- `redesign-skill`: Audit-first UI redesign workflow.
- `output-skill`: Complete implementation enforcement (bans placeholders and `// TODO`).
- `brandkit`, `minimalist-skill`, `brutalist-skill`, `soft-skill`, `stitch-skill`.

## 2. Mandatory Protocol Before Writing UI Code
Always state your Design Read:
`Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <aesthetic>. Dials: VARIANCE [X] / MOTION [Y] / DENSITY [Z].`

### Baseline Dials:
- `DESIGN_VARIANCE`: 8 (Asymmetry, unexpected layout cadence)
- `MOTION_INTENSITY`: 6 (Fluid GSAP ScrollTrigger, spring physics)
- `VISUAL_DENSITY`: 4 (Airy luxury editorial, breathing room)

## 3. Iron Rules
1. **Typography:** Never default to plain Inter. Use `Outfit`, `Cabinet Grotesk`, `Satoshi`, `Geist`, `Instrument Serif`, or `Newsreader`.
2. **Hero Headers:** Never wrap H1 into 4-6 lines. Keep containers wide (`max-w-5xl` to `max-w-6xl`) and clamp font size so H1 flows in 2-3 lines max.
3. **Spacing:** Maintain `py-28 md:py-44` between major page sections.
4. **Color:** One locked accent color across the page. Desaturated neutrals. No generic purple glow.
5. **Grids:** Use `grid-auto-flow: dense` with interlocking spans. No empty void cells.
6. **No Placeholders:** Output complete, working code. Never truncate with `// ...` or `// TODO`.
