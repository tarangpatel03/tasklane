---
name: ui-design-quality
description: Use before designing or building any UI (screens, components, pages, themes, animations) on mobile or web. Enforces a brief-first process, design tokens, color and typography rules, and an anti-"AI look" checklist.
---

# UI design quality

## Process (in this order)

1. Read `docs/design-brief.md`. If it is missing or empty, ask for: product purpose, audience, 3 reference apps/sites (or screenshots/Figma), mood words, brand colors if any. Do not start styling without a direction.
2. Define tokens in code before any screen: semantic colors, type scale, spacing scale, radii, elevation, motion. One file (theme.ts, Tailwind config or CSS variables). Components use tokens only: no raw hex or magic pixel values.
3. Build small reusable components first (Button, Input, Card, ListItem, Header). Every one has states: default, pressed/hover, focus, disabled, loading, error, empty.
4. Compose one screen at a time. Verify visually before starting the next.

## Color

- Derive from the brief. Structure: neutral scale (9-11 steps), one primary, at most one accent, semantic success/warning/danger/info. Roughly 60% neutral, 30% secondary surfaces, 10% accent.
- Tint the neutrals toward the brand hue. Avoid pure #000 / #fff / flat gray for large surfaces.
- Contrast: body text >= 4.5:1, large text and UI boundaries >= 3:1.
- Dark mode is its own palette, not an inversion.
- Do not use default purple-to-blue gradients, neon glows or rainbow gradients as a substitute for personality.

## Typography

- At most 2 families (one family with several weights is fine). Pair by role (display + text), chosen from the brief's mood. Choose fonts deliberately; do not default to Inter/Roboto/system just because it is the default.
- Type scale from a ratio: ~1.2-1.25 on mobile, ~1.25-1.333 on web. 5-7 sizes total.
- Line height: 1.4-1.6 body, 1.1-1.25 large headings. Slightly tighter tracking on large headings.
- Build hierarchy with size, weight and color contrast, not by bolding everything.
- Web line length: 60-75 characters.

## Layout and spacing

- 4/8 grid. Spacing from tokens only. Align to a consistent column grid.
- Group by proximity, give generous whitespace, one primary action per screen.
- Vary composition between sections. Not every section is a centered block of identical cards.

## Components, icons, content

- One icon set (Lucide, Phosphor or Material Symbols) with consistent stroke. Never emoji as UI icons.
- One shape language: radius and elevation follow the brief and stay consistent.
- Realistic content: believable copy, names, numbers. No lorem ipsum, "John Doe" or "Feature 1".
- Imagery is real or purposeful. No generic gradient blobs.

## Motion principles (shared)

- Motion explains state change (enter, exit, feedback, hierarchy). It is never decoration that makes the user wait.
- Durations: micro feedback 100-200ms, element transitions 200-350ms, page or sheet 300-500ms. Ease-out for entering, ease-in for exiting, springs for gestures. Define motion tokens.
- Animate transform and opacity only. Keep animations interruptible. Respect reduced-motion settings.
- Every interactive element gives feedback: pressed/hover/focus.
- Stagger lists subtly: 30-60ms steps, total under ~400ms.

## Anti-"AI look" checklist (fail the design if any are true)

- Purple/indigo gradient hero, glassmorphism everywhere, or gradient text on headings
- Identical rounded cards with large shadows in a 3-column grid
- Emoji icons, lorem ipsum, or a stock "Welcome to X" hero with two buttons
- Many font sizes/weights, or low-contrast gray body text
- Unmodified component-library defaults (shadcn, Paper, NativeBase and similar) that were not restyled through tokens
- Everything centered with no focal point
- Borders, shadows and gradients all stacked on the same element
- Inconsistent spacing between similar elements

## Before reporting done

Check the result visually (screenshots at the sizes listed in the platform skill) against the brief and the checklist above. Fix failures first. Then give only the one-line status.
