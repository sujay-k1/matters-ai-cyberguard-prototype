---
name: Sentinel Security
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#424656'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#737687'
  outline-variant: '#c3c6d8'
  surface-tint: '#0052dd'
  primary: '#004ccd'
  on-primary: '#ffffff'
  primary-container: '#0f62fe'
  on-primary-container: '#f3f3ff'
  inverse-primary: '#b4c5ff'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e4e2e1'
  on-secondary-container: '#656464'
  tertiary: '#6e2fc9'
  on-tertiary: '#ffffff'
  tertiary-container: '#874de3'
  on-tertiary-container: '#faf1ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174c'
  on-primary-fixed-variant: '#003da9'
  secondary-fixed: '#e4e2e1'
  secondary-fixed-dim: '#c8c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474747'
  tertiary-fixed: '#ecdcff'
  tertiary-fixed-dim: '#d5bbff'
  on-tertiary-fixed: '#270057'
  on-tertiary-fixed-variant: '#5c14b7'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
  layer-0: '#F4F4F4'
  layer-1: '#FFFFFF'
  layer-2: '#F4F4F4'
  border-subtle: '#E0E0E0'
  border-strong: '#8D8D8D'
  critical: '#DA1E28'
  high: '#FF832B'
  medium: '#F1C21B'
  low: '#8D8D8D'
  success: '#24A148'
  status-new-bg: '#D0E2FF'
  status-new-text: '#0043CE'
  status-investigating-bg: '#E8DAFF'
  status-investigating-text: '#6929C4'
  status-assigned-bg: '#D9FBFB'
  status-assigned-text: '#005D5D'
  status-approval-bg: '#FFE6D5'
  status-approval-text: '#A24300'
typography:
  display-lg:
    fontFamily: IBM Plex Sans
    fontSize: 42px
    fontWeight: '300'
    lineHeight: 50px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: IBM Plex Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-base:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.16px
  body-bold:
    fontFamily: IBM Plex Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.16px
  body-mono:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: '0'
  label-caps:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.32px
  helper-text:
    fontFamily: IBM Plex Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.32px
  headline-md-mobile:
    fontFamily: IBM Plex Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style

The design system is a high-precision, enterprise-grade framework engineered for cybersecurity operations. It is designed to evoke a sense of **absolute control, technical authority, and calm precision** during high-stress monitoring tasks. The system prioritizes information density and clarity over decorative flair, ensuring that analysts can triage massive volumes of data with minimal cognitive load.

The visual style is **Corporate / Modern**, heavily influenced by the IBM Carbon Design System (v11). It utilizes a flat, layered architecture characterized by:
- **Sharp Geometry:** A strict adherence to 0px border radii for structural components, reinforcing a disciplined and engineered aesthetic.
- **Layered Depth:** Hierarchy is established through tonal shifts in background surfaces rather than shadows.
- **High Density:** Compact vertical rhythms and tight spacing scales (4px/8px) to maximize screen real estate.
- **Utilitarian Focus:** A clear distinction between UI chrome (neutral grays) and semantic alerts (vibrant, severity-based color coding).

## Colors

The palette is strategically divided into structural neutrals, interactive primaries, and severity-driven semantic tones.

### Surface Architecture
The system uses a **layered surface model** to define hierarchy:
- **Layer 0 (Canvas):** `#F4F4F4` – The base application background.
- **Layer 1 (Surface):** `#FFFFFF` – Primary containers, cards, and data tables.
- **Layer 2 (Nested):** `#F4F4F4` – Inset areas within Layer 1 surfaces (e.g., sidebars, nested forms).

### Interactive States
- **Primary Action:** `#0F62FE` (Hover: `#0050E6`)
- **Secondary Action:** `#393939` (Hover: `#474747`)
- **Focus:** 2px solid `#0F62FE` with a 1px white offset.

### Semantic & Status
- **Severity Scale:** Critical (Red), High (Orange), Medium (Yellow), and Low (Gray) are used for alert triage.
- **Status Badges:** Use specific light-tint backgrounds with high-contrast text to track workflow states (New, Investigating, Assigned, Awaiting Approval).

## Typography

Typography is optimized for legibility and data interpretation. The system utilizes **IBM Plex Sans** for standard UI elements and **IBM Plex Mono** for technical strings, including IP addresses, hashes, and timestamps.

### Usage Guidelines
- **Vertical Rhythm:** All line heights are multiples of 4px to align with the base spacing grid.
- **Technical Data:** Always use `body-mono` for any system-generated output or unique IDs to maintain character distinction (e.g., differentiating '0' from 'O').
- **Emphasis:** Use `label-caps` for table headers and status tags to provide visual distinction from body content.
- **Accessibility:** Large display sizes scale down on mobile devices while maintaining proportional line heights.

## Layout & Spacing

This design system uses a **fixed 16-column grid** for desktop environments, ensuring predictable placement of high-density data components.

### Layout Model
- **Base Unit:** 4px grid. All dimensions and paddings must be multiples of 4.
- **Gutter:** 16px (spacing-lg) between all grid columns.
- **Margins:** 32px on desktop; 16px on mobile.

### Breakpoints
- **Small (sm):** 320px | 4 columns (Mobile)
- **Medium (md):** 672px | 8 columns (Tablet)
- **Large (lg):** 1056px | 16 columns (Standard Desktop)
- **Max:** 1584px | 16 columns (Ultra-wide)

### Responsive Reflow
Content follows a "compact-first" approach. Sidebars collapse into a 48px icon-only rail on tablet views. Data tables should implement horizontal scrolling for internal columns while keeping the "Severity" and "Action" columns pinned.

## Elevation & Depth

The design system employs a **flat, tonal layering** philosophy. Depth is communicated via background color contrast rather than shadows to maintain a clean, engineered look.

- **Tonal Layers:** High-priority cards (Layer 1 - White) sit on the Canvas (Layer 0 - Gray 10) to define boundaries.
- **Interactive Depth:** Hover states use color fills (e.g., `#E8E8E8`) rather than elevation to indicate clickability.
- **Outlines:** Subtle 1px borders (`#E0E0E0`) are the primary method for defining component perimeters.
- **Overlays:** Modals and tooltips use a very soft ambient shadow (`box-shadow: 0 2px 4px rgba(0,0,0,0.1)`) to provide just enough separation from the underlying content without disrupting the flat aesthetic.

## Shapes

The shape language is **Sharp (0px)**. This choice reinforces the precision and industrial nature of an enterprise security tool.

- **Structural Elements:** Buttons, inputs, cards, and dropdowns all feature 90-degree corners.
- **Exceptions:** Status tags/badges may use a "Pill" shape (rounded-full) to differentiate them as semantic markers rather than structural UI components.
- **Selection:** Selected states in lists or tables are indicated by a 4px solid left-border accent using the primary color.

## Components

### Buttons
- **Primary:** Solid `#0F62FE`, sharp corners, 14px bold white text. Right-aligned 16px icon.
- **Secondary:** Solid `#393939`, sharp corners, white text.
- **Ghost:** Transparent background with `#0F62FE` text and icons.
- **Sizing:** Compact (32px), Default (40px), Large (48px).

### Data Tables
- **Header:** Background `#F4F4F4`, 12px Semibold Caps text.
- **Rows:** 32px (compact) or 40px (standard) height. 1px solid bottom border (`#E0E0E0`).
- **States:** Hover (`#E8E8E8`), Selected (`#E0E0E0`).

### Input Fields
- **Default:** Solid `#F4F4F4` background with a 1px bottom border in `#8D8D8D`.
- **Focus:** 2px solid `#0F62FE` ring around the entire container.
- **Labels:** 12px persistent label sitting above the field in `#525252`.

### Status Badges & Chips
- **Severity Indicators:** 16x16px square color blocks (Red/Orange/Yellow/Gray) containing a numeric severity value.
- **Workflow Tags:** Pill-shaped, low-saturation background with matching high-saturation text (e.g., Investigating: `#E8DAFF` bg / `#6929C4` text).

### Navigation Shell
- **Header:** 48px height, solid `#161616` background. Icons are 20x20px white.
- **Side Nav:** 256px wide (Desktop), solid `#FFFFFF` with a 1px right border. Active state shown with a 4px left blue bar.