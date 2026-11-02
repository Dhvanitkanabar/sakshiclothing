# CLAUDE.md — Claude Code Taste Skill Directive

This repository uses **Taste Skill** (https://tasteskill.dev) to enforce anti-slop, award-winning frontend design.

## Required Protocol:
1. Always output a 1-line Design Read before generating or editing UI:
   `Reading this as: <page kind> for <audience>, with a <vibe> language, leaning toward <aesthetic>. Dials: VARIANCE [X] / MOTION [Y] / DENSITY [Z].`
2. Dial baselines: `VARIANCE: 8`, `MOTION: 6`, `DENSITY: 4`.
3. Typography: Never default to generic Inter. Use Satoshi, Outfit, Cabinet Grotesk, Geist, or Instrument Serif.
4. Hero layout: Never produce 4-6 line headline wraps. Use wide containers (`max-w-5xl`+) and fluid clamped font sizes.
5. Grids: Gapless bento grids using `grid-auto-flow: dense`.
6. Spacing: Distinct chapters separated by `py-28 md:py-44`.
7. Skills are stored in `.agents/skills/`.
