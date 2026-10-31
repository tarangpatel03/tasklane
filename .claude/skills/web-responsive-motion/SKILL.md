---
name: web-responsive-motion
description: Use when building or changing web pages or components (React, Next, Vite, plain HTML/CSS). Covers fully responsive layout from 320px to ultrawide, fluid type and spacing, polished animation and micro-interactions, accessibility, and screenshot verification.
---

# Web responsive layout and motion

## Responsive

- Mobile-first. Define breakpoints once as tokens (default 480 / 768 / 1024 / 1280 / 1536; adjust to the brief). Prefer content-driven breaks.
- Fluid type and spacing with `clamp()`. Layout with CSS grid/flex, `minmax()` and `auto-fit`. Use container queries for components, and `dvh` instead of `vh` on mobile.
- No horizontal scroll at any width from 320px up.
- Images: `aspect-ratio`, `object-fit`, `srcset`/`sizes`, explicit width/height to prevent layout shift, `loading="lazy"` below the fold.
- Navigation: full bar on desktop, drawer or sheet on mobile. Tap targets at least 44px. Hover-only interactions need a touch equivalent (`@media (hover: hover)`).
- Center content at a max width (about 1200-1440px) so ultrawide screens do not stretch it. Wide tables become cards or scroll containers on small screens.
- Test widths: 320, 375, 390, 768, 1024, 1280, 1440, 1920.

## Animation

- Libraries: Motion (Framer Motion) for React component, presence, layout and gesture animation; GSAP + ScrollTrigger for complex timelines and scroll storytelling; Lenis only if smooth scroll is in the brief; plain CSS transitions for simple hover/focus. Do not use two libraries for the same job. Ask before adding one.
- Page load: staged entrance (headline, then media, then secondary content), 40-80ms stagger, under ~700ms total.
- Scroll reveals: once only, subtle (translate 16-24px plus opacity), via `whileInView` or IntersectionObserver. No parallax overload.
- Micro-interactions: buttons (hover color or lift, pressed scale about 0.97), links (underline motion), inputs (focus ring, floating label), toggles and checkboxes (spring), cards (hover transform), skeleton loaders, success/error feedback, optimistic UI.
- Route transitions: short crossfade or slide with stable layout.
- Performance: animate only `transform` and `opacity`. No animating width/height/top/left. Use `will-change` sparingly. No scroll listeners that cause jank. Target 60fps.
- Accessibility: under `prefers-reduced-motion: reduce`, remove parallax and large movement and keep simple opacity fades. All interactive elements have visible `:focus-visible` styles and work by keyboard.

## Quality

- Semantic HTML, ordered headings, alt text, labelled inputs, sufficient contrast.
- Aim for Lighthouse >= 90 in performance and accessibility, CLS near 0. Fonts: `font-display: swap`, preload the primary font, subset when possible.
- Dark mode, if in the brief, swaps CSS variable tokens.

## Verify before reporting done

- If a Playwright or Chrome DevTools MCP is available, screenshot each test width and check the console for errors. Otherwise ask the user to run the dev server and share screenshots.
- Fix overflow, overlap, tiny tap targets, layout shift and animation jank before reporting.
