---
name: ReqGit Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  container-max: 1280px
  gutter: 1rem
---

## Brand & Style

The design system is built for a professional SaaS environment focused on the precision of Software Requirements Specifications (SRS). The brand personality is **reliable, technical, and unobtrusive**, ensuring that the complex content of documentation remains the primary focus.

The visual style follows a **Modern Enterprise** aesthetic, blending the systematic efficiency of developer tools with the clarity of premium document editors. It utilizes a refined palette and high-quality typography to evoke a sense of "robust calmness." The goal is to provide a workspace that feels like a high-performance instrument—sharp, responsive, and trustworthy.

Key principles:
- **Clarity over Decoration:** Every visual element must serve a functional purpose.
- **Systematic Consistency:** Layouts follow a strict logic to reduce cognitive load during version comparison.
- **Utility-First:** Features like diff-viewing and audit logs are treated with the same visual importance as primary navigation.

## Colors

The color system is anchored by a functional **Blue/Indigo** primary for core actions and status indicators. The foundation is built on a "Slate" scale to provide a neutral, sophisticated backdrop that avoids the sterile feel of pure grayscale.

- **Primary (#2563eb):** Used for primary buttons, active states, and critical paths.
- **Background (#f8fafc):** A cool Slate-50 base that minimizes eye strain during long reading sessions.
- **Text Primary (#1e293b):** Slate-800 provides deep contrast for headers and body copy to ensure maximum legibility.
- **Text Secondary (#64748b):** Slate-500 is reserved for metadata, labels, and auxiliary information.
- **Borders (#e2e8f0):** Slate-200 provides subtle structural definition without creating visual noise.

## Typography

This design system uses a tri-font strategy to balance character and utility:
1. **Hanken Grotesk** is used for headlines. Its sharp, contemporary geometry provides a modern SaaS identity.
2. **Inter** is the workhorse for body text, chosen for its exceptional legibility in dense document views.
3. **JetBrains Mono** is utilized for technical metadata, version hashes, and "diff" views, signaling a developer-centric precision.

Tight letter spacing is applied to larger headlines to maintain a compact, "designed" feel. Body text relies on generous line heights to facilitate the reading of long-form requirements.

## Layout & Spacing

The layout employs a **Fluid-Fixed Hybrid** model. Navigation and sidebars are fluid to maximize utility, while document content resides in a centered, max-width container (1280px) to maintain line-length readability.

**Grid System:**
- **Mobile:** Single column with 16px (1rem) side margins.
- **Tablet:** 12-column grid with 24px margins. Sidebars become collapsible drawers.
- **Desktop:** 12-column grid with a permanent left navigation rail (240px). Gutters are fixed at 16px to keep content dense and professional.

Spacing follows a linear 4px scale, ensuring that elements are aligned with mathematical rigor.

## Elevation & Depth

To maintain the "flat" professional look of a developer tool, this design system avoids heavy shadows. Instead, it uses **Tonal Layering** and **Low-Contrast Outlines**.

- **Surface Levels:** The main workspace sits on the background (Slate-50). Floating panels, such as sidebars or modals, use the primary surface (White).
- **Shadows:** Use a singular, highly-diffused shadow (`shadow-sm`) for interactive components like cards and dropdowns to provide a subtle "lift" without breaking the flat aesthetic.
- **Outline:** Every interactive container should have a 1px border in Slate-200. This provides structural definition that is more robust and accessible than shadows alone.

## Shapes

The shape language is defined by **Soft Precision**. We use a base roundedness of 0.5rem (8px) for standard components like buttons and inputs. 

For larger layout containers, such as document cards or the main content area, we use `rounded-xl` (1.5rem / 24px) to soften the enterprise environment and make it feel more approachable. This contrast between "tight" internal components and "broad" outer containers creates a modern, layered appearance.

## Components

### Buttons
- **Primary:** Solid Blue-600 background, white text. No gradient. 8px radius.
- **Secondary:** Ghost style with Slate-200 border and Slate-800 text.
- **State:** On hover, primary shifts to Blue-700. On active/click, it shifts to Blue-800.

### Cards & Document Containers
- Cards use a White background with a Slate-200 border. 
- Use `shadow-sm` only on hover to indicate interactivity.
- Headers within cards should have a subtle Slate-50 bottom border.

### Input Fields
- Inputs must have a 1px border in Slate-300.
- Use Inter 14px for input text.
- Focus state: 1px Blue-600 border with a subtle blue outer glow (2px).

### Chips & Tags
- Used for "Status" (e.g., Draft, Approved, Deprecated).
- Style: Small (12px), semi-bold, 10% opacity background of the status color (e.g., Green-100 bg with Green-700 text).

### Version Diff View
- **Additions:** Subtle green background (#f0fdf4) with a darker green left-border accent.
- **Deletions:** Subtle red background (#fef2f2) with a darker red left-border accent.
- Always use JetBrains Mono for the content within diff views to emphasize technical accuracy.