# Color Audit Report for NotZero Codebase

## Current Color Palette Usage

Based on the search through the codebase, here's a comprehensive list of all color classes found:

### Green Colors (Most Common - Primary Brand Color)
- **Backgrounds**: 
  - `bg-green-50` (light backgrounds)
  - `bg-green-100` (Navigation logo background)
  - `bg-green-600` (primary buttons, CTAs)
  - `bg-green-700` (hover states)
  - `bg-green-900/20`, `bg-green-900/30` (semi-transparent overlays)
- **Text**: 
  - `text-green-400`, `text-green-500`, `text-green-600`, `text-green-700`
- **Borders**: 
  - `border-green-200`, `border-green-500`, `border-green-600`
- **Focus/Ring**: 
  - `focus:ring-green-500`, `focus:border-green-500`
- **Gradients**: 
  - `from-green-50`

### Gray Colors (UI Foundation)
- **Backgrounds**: 
  - `bg-gray-50`, `bg-gray-100`, `bg-gray-200`, `bg-gray-300`, `bg-gray-400`, `bg-gray-700`, `bg-gray-900`
- **Text**: 
  - `text-gray-500`, `text-gray-600`, `text-gray-700`, `text-gray-800`, `text-gray-900`
- **Borders**: 
  - `border-gray-200`, `border-gray-300`

### Blue Colors (Secondary/Accent)
- **Backgrounds**: 
  - `bg-blue-50`, `bg-blue-100`, `bg-blue-600`
- **Text**: 
  - `text-blue-600`, `text-blue-700`
- **Gradients**: 
  - `to-blue-50`

### Yellow/Amber Colors (Alerts, Hero Mode)
- **Backgrounds**: 
  - `bg-yellow-50`, `bg-yellow-300`, `bg-yellow-400`, `bg-yellow-500`, `bg-yellow-600`, `bg-yellow-700`
  - `bg-amber-50`, `bg-amber-600`
- **Text**: 
  - `text-yellow-500`, `text-yellow-600`, `text-yellow-700`, `text-yellow-800`
  - `text-amber-600`
- **Borders**: 
  - `border-yellow-300`
- **Gradients**: 
  - `from-yellow-50`, `to-amber-50`, `from-yellow-400`, `to-yellow-500`, `from-yellow-500`, `to-yellow-600`, `from-yellow-600`, `to-yellow-700`

### Purple/Indigo Colors (Special Features)
- **Backgrounds**: 
  - `bg-purple-50`, `bg-purple-100`, `bg-purple-600`
- **Text**: 
  - `text-purple-600`, `text-purple-700`
- **Borders**: 
  - `border-purple-200`, `border-purple-300`
- **Gradients**: 
  - `from-purple-50`, `to-indigo-50`

### Red/Pink Colors (Errors, Alerts)
- **Backgrounds**: 
  - `bg-red-50`, `bg-red-500`
- **Text**: 
  - `text-red-500`, `text-red-600`

### Orange Colors (Categories, Tags)
- **Backgrounds**: 
  - `bg-orange-50`, `bg-orange-100`
- **Text**: 
  - `text-orange-600`, `text-orange-700`

### Emerald Colors (Environmental Features)
- **Backgrounds**: 
  - `bg-emerald-50`
- **Text**: 
  - `text-emerald-600`

## Key Files Using Colors

### Primary Pages
1. **HomePageV2.tsx**
   - Primary gradient: `from-green-50 to-blue-50`
   - Green CTAs: `bg-green-600 hover:bg-green-700`
   - Purple/Indigo for guess section: `from-purple-50 to-indigo-50`
   - Yellow for hero mode: `from-yellow-50 to-amber-50`, various yellow gradients

2. **Navigation.tsx**
   - Logo background: `bg-green-100`
   - Logo icon: `text-green-600`
   - CTA button: `bg-green-600 hover:bg-green-700`

3. **OffsetOrderPage.tsx**
   - Same gradient: `from-green-50 to-blue-50`
   - Green buttons and highlights
   - Yellow for hero mode sections

4. **CheckoutPage.tsx**
   - Same gradient: `from-green-50 to-blue-50`
   - Green CTAs
   - Yellow/amber for hero mode

### Component Usage
- Forms use `focus:ring-green-500` for focus states
- Success states use green colors
- Error states use red colors
- Info/special features use blue and purple colors

## Recommended Color Mapping

Based on the new palette provided:
- Primary blue (#003e6d) → Replace `green-600/700` for CTAs and primary actions
- Light gray (#a3abbd) → Replace `gray-500/600` for secondary text
- Medium gray (#6f7788) → Replace `gray-700` for primary text
- Deep red (#68253a) → Replace current red colors for errors
- Pink/mauve (#9e5569) → Replace purple colors for special features

## Implementation Priority

1. **High Priority** (Most visible):
   - Navigation CTAs and logo
   - Primary buttons (bg-green-600/700)
   - Main gradients (from-green-50 to-blue-50)

2. **Medium Priority**:
   - Form focus states
   - Secondary buttons
   - Card backgrounds

3. **Low Priority**:
   - Tag colors
   - Icon colors
   - Subtle accents