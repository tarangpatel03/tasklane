---
name: rn-responsive-ui
description: Use when building or changing React Native screens or navigation. Covers responsive layout for all phones, tablets and foldables, list-detail split view, safe-area insets, keyboard, font scaling, and device verification.
---

# React Native responsive UI

## Safe areas and system bars

- Use `react-native-safe-area-context`. `<SafeAreaProvider>` at the root. Apply insets with `useSafeAreaInsets()` or its `SafeAreaView` with explicit `edges`.
- Never use React Native's built-in `SafeAreaView` (iOS only). Never hardcode status bar, notch or nav bar heights.
- If the app draws behind system bars (edge-to-edge on Android), every screen must handle top (status bar, cutout), bottom (gesture/nav bar) and left/right (landscape cutouts, hinge areas). Set the status bar style per screen background.
- Inputs must never be hidden by the keyboard. Forms scroll, use `keyboardShouldPersistTaps="handled"`, and use `react-native-keyboard-controller` if already installed, otherwise `KeyboardAvoidingView`.

## Sizing

- Use `useWindowDimensions()`. Never read `Dimensions.get()` at module scope: it goes stale on rotation, fold/unfold, split-screen and multi-window.
- Lay out with flex, percentages, `aspectRatio`, `minWidth`/`maxWidth`. Avoid fixed widths/heights on containers.
- Spacing and sizes come from tokens. If a scaling helper is needed, cap it so tablets do not get giant UI.
- Text: honor the user's font scale. Let text wrap, design tight UI (tabs, buttons) for 2 lines, and set `maxFontSizeMultiplier` (about 1.3) only where space is tight.
- Touch targets at least 48dp.
- Branch on window size class, never on device brand or model.

## Window size classes (the only place these numbers live)

Create one hook, `useWindowClass()`, returning `'compact' | 'medium' | 'expanded'` plus `isLandscape`, from window width in dp:

- compact: width < 600 (phones portrait). Single pane, bottom tabs, stack navigation.
- medium: 600-839 (large phones landscape, small tablets, unfolded foldables in portrait). Single pane with wider margins and a content max width, or a 2-column grid. Navigation rail optional.
- expanded: width >= 840 (tablets, unfolded foldables landscape). List-detail split and a navigation rail instead of bottom tabs.

## Wide-screen patterns

1. Full-width single screen (forms, settings, feeds, articles): never stretch text and inputs edge to edge. Center the content with `maxWidth` (about 560-720dp), or use a grid whose `numColumns` comes from width / minimum item width.
2. List-detail split (chats, mail, tasks, catalog, anything like WhatsApp):
   - compact: list screen; tapping pushes a detail screen with a back button.
   - expanded: one screen with a fixed-width list pane on the left (320-400dp) and the detail pane on the right. Tapping an item highlights it and swaps the detail pane in place. Show an empty-state placeholder in the right pane when nothing is selected. No push, no back button.
   - Build list and detail as separate presentational components reused by both modes, inside one `ListDetail` layout component.
   - Keep the selected id in route params or state so rotation, folding and unfolding keep the selection: unfolding with a detail open shows list + that detail, folding shows that detail with a way back to the list.
   - Any navigation to a detail from elsewhere sets the selection in expanded mode instead of pushing a screen.

## Foldables and resizing

- Do not lock orientation. The layout must react to window changes (fold/unfold, split-screen, freeform windows, rotation) without restarting or losing state.
- Keep `screenSize|smallestScreenSize|screenLayout|orientation` in `android:configChanges` in AndroidManifest (the React Native template includes them). Do not remove them.
- Avoid placing key content across the fold or hinge. If hinge data is needed, ask before adding a dependency.

## Verify before reporting done

- Screenshot the device: `adb shell screencap -p /sdcard/s.png` then `adb pull /sdcard/s.png .claude/tmp/screen.png`, then read the image. Keep `.claude/tmp/` out of git.
- Check these sizes (Android Studio emulators work: Pixel 8, Pixel Tablet, Resizable/Pixel Fold): small phone 360x640dp, standard 390x844, large 430x932, tablet portrait 800x1280, tablet landscape 1280x800, foldable open about 840x900.
- Check: nothing under status/nav bars or cutouts, no horizontal overflow, readable at 130% font scale, rotation and resize keep state.
