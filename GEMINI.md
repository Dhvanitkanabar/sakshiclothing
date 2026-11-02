# GEMINI.md — Taste Skill Design & Engineering Rules

This repository enforces **Taste Skill** (https://www.tasteskill.dev/) to prevent AI-generated frontend slop.

## Directives:
- **Design Read:** Every UI generation must begin with a 1-line Design Read specifying audience, vibe, design family, and the 3 Dials (`VARIANCE`, `MOTION`, `DENSITY`).
- **Typography:** Banned plain Inter. Use characterful typography (`Outfit`, `Cabinet Grotesk`, `Satoshi`, `Geist`, `Instrument Serif`).
- **Layout Variance:** No 3 equal cards, no 6-line hero titles. Use wide containers and clamp typography.
- **Motion:** Rich GSAP ScrollTrigger and Motion physics.
- **Installed Skills:** Check `.agents/skills/` for `taste-skill`, `gpt-tasteskill`, `redesign-skill`, `output-skill`, `brandkit`, and others.
