---
name: Cupertino Precision
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1b1b1b'
  on-surface-variant: '#4c4546'
  inverse-surface: '#303030'
  inverse-on-surface: '#f1f1f1'
  outline: '#7e7576'
  outline-variant: '#cfc4c5'
  surface-tint: '#5e5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1b1b1b'
  on-primary-container: '#848484'
  inverse-primary: '#c6c6c6'
  secondary: '#5d5e63'
  on-secondary: '#ffffff'
  secondary-container: '#e0dfe4'
  on-secondary-container: '#626267'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a1c1f'
  on-tertiary-container: '#828488'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c6'
  on-primary-fixed: '#1b1b1b'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e3e2e7'
  secondary-fixed-dim: '#c6c6cb'
  on-secondary-fixed: '#1a1b1f'
  on-secondary-fixed-variant: '#46464b'
  tertiary-fixed: '#e2e2e7'
  tertiary-fixed-dim: '#c6c6cb'
  on-tertiary-fixed: '#1a1c1f'
  on-tertiary-fixed-variant: '#45474b'
  background: '#f9f9f9'
  on-background: '#1b1b1b'
  surface-variant: '#e2e2e2'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.022em
  h1:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.017em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.014em
  body-lg:
    fontFamily: Inter
    fontSize: 19px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: -0.006em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.06em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1140px
  gutter: 24px
  section-padding: 120px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is anchored in the "Functional Elegance" of modern mobile operating systems. It targets a high-end audience of technical recruiters, product founders, and design collaborators. The aesthetic is a fusion of **Minimalism** and **Glassmorphism**, emphasizing the developer's mastery over the Apple ecosystem. 

The emotional response is one of absolute clarity, technical competence, and premium quality. By utilizing high-density whitespace and a restricted color palette, the system allows the developer's work (app screenshots and code) to become the focal point. The interface feels light, responsive, and tactile, echoing the fluid physics of iOS.

## Colors

The palette is strictly monochrome to mirror professional hardware aesthetics. 
- **Light Mode:** Uses a "Crisp White" (#FFFFFF) base with "Deep Black" (#1C1C1E) text. 
- **Dark Mode:** Transitions to a true black (#000000) background to take advantage of OLED displays, with high-contrast white text.
- **Accents:** "Brushed Silver" is achieved through subtle gradients rather than flat hex codes, providing a metallic, premium feel to buttons and dividers. 
- **Semantic Colors:** Use standard Apple-inspired tints for system feedback (e.g., #007AFF for links), but keep them desaturated to maintain the minimalist core.

## Typography

The typography utilizes **Inter**, selected for its systematic, utilitarian nature that closely mimics Apple's San Francisco. 
- **Hierarchy:** Dramatic scale shifts between display headings and body text create an editorial feel. 
- **Letter Spacing:** Negative tracking is applied to large headings to maintain a tight, "locked-in" professional look, while labels use slightly expanded tracking for legibility at small sizes.
- **Rendering:** Anti-aliasing must be optimized for high-density displays (Retina).

## Layout & Spacing

This design system uses a **Fixed Grid** approach for desktop, centering content within a 1140px max-width container to ensure high-end readability. 
- **Generous Whitespace:** Section vertical padding is intentionally large (120px+) to allow the content to breathe and signify importance.
- **8px Rhythm:** All spacing between elements follows an 8-point grid system to ensure mathematical harmony.
- **Alignment:** Left-aligned typography is preferred for the portfolio sections to maintain a clean vertical axis, while hero sections may utilize centered layouts for impact.

## Elevation & Depth

Depth is established through **Glassmorphism** and soft ambient light rather than traditional drop shadows.
- **Materials:** Use backdrop-filter: blur(20px) with a semi-transparent white (or black in dark mode) fill at 70% opacity for navigation bars and floating cards.
- **Borders:** "Hairline" strokes (0.5pt or 1px) in a light grey (#D1D1D6) should define glass elements, simulating the edge of a glass pane.
- **Shadows:** When necessary, use extremely diffused shadows (30px-60px blur) with very low opacity (5-10%) to suggest the element is floating slightly above the surface.

## Shapes

The shape language follows the "Squircle" philosophy of iOS. 
- **Standard Elements:** Buttons and small cards use a 16px (rounded-lg) radius.
- **Container Elements:** Large content blocks or feature cards use a 24px (rounded-xl) radius.
- **Interaction:** On hover, shapes may slightly increase their scale or shift their corner radius to provide tactile feedback without breaking the minimal aesthetic.

## Components

- **Buttons:** Primary buttons feature a "Brushed Silver" gradient or solid Black. Secondary buttons are "Ghost" style with a 1px border. All buttons have high horizontal padding (24px+).
- **Cards:** Project cards utilize the glassmorphism effect. Content should be masked by the card's rounded corners. Avoid internal borders; use spacing to separate metadata.
- **Chips/Tags:** Used for "Tech Stacks" (e.g., Swift, SwiftUI). These should be pill-shaped with a subtle grey background (#F2F2F7) and small, bold text.
- **Navigation:** A fixed top-bar with a heavy backdrop-blur effect. Links should use the `label-caps` typography style.
- **Input Fields:** Minimalist under-line style or soft-filled rectangles with 8px corner radius. Focus states should be indicated by a subtle glow or a shift in the hairline border color.
- **App Mockups:** When displaying work, wrap screenshots in realistic device frames (iPhone/MacBook) to reinforce the expert developer positioning.