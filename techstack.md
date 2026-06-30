# Tech Stack - STEM Quest Frontend

To satisfy the requirements of rural low-end devices and low-connectivity environments:

## 1. Core Architecture (Frontend)
- **HTML5**: Standard semantic document structure providing natural accessibility guidelines (large fonts, structural headers, voice layout hooks).
- **CSS3 (Vanilla)**: High-performance animations and styling without the heavy load of TailwindCSS or bootstrap builds. Enables direct hardware acceleration on mobile GPU.
- **Vanilla ES6+ JavaScript**: Lightweight script files allowing fast page responsiveness, client-side state persistence, offline simulations (STEM Lab circuit builders), and no complex node dependency pipelines.

## 2. Gamification Design Specs
- **Color Theme**:
  - Primary Purple (`#6C63FF`) for dashboard controls and branding.
  - Success Green (`#34C759`) for progress meters and correctly solved quests.
  - Accent Gold/Orange (`#FFB703`) for XP counters, streak flame, coins, and badges.
- **Typography**:
  - `Poppins` (Bold & SemiBold) for headers to create an exciting, game-like appearance.
  - `Inter` for highly readable body content on low-end screens.

## 3. Deployment & Offline Adaptations
- The entire page can run as a **Single Page Application (SPA)** that works completely offline once cached by browser service workers (future enhancement) or local file storage.
- All simulation assets (e.g., bulb, switches, wires, battery) are dynamically drawn using SVG rather than heavy PNG assets to minimize network usage.
