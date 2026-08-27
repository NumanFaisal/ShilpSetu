/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ShilpSetu Design System — Burnt Terracotta & Warm Ivory
        primary: '#B5502F',       // Burnt terracotta — CTAs, active states
        'primary-dark': '#953919', // Darker terracotta for pressed states
        'primary-light': '#FFDBD0', // Light terracotta tint
        secondary: '#5B6E4E',     // Muted sage — buyer accents, success
        'secondary-light': '#D1E6BF', // Light sage tint
        background: '#FFF8F6',    // Warm ivory — never pure white
        surface: '#FFFDF8',       // Card background, slightly brighter
        'surface-dim': '#F8EAE4', // Slightly dimmer surface
        ink: '#2B2420',           // Warm near-black text
        'ink-secondary': '#56423C', // Secondary text, muted
        border: '#E4D8C3',        // 1px card borders — NO shadows
        'border-active': '#B5502F', // Active/focused border
        error: '#9C4A3C',         // Error red
        'error-light': '#FFDAD6', // Error background
        // Extended palette from Stitch design system
        'on-primary': '#FFFFFF',
        'on-secondary': '#FFFFFF',
        'on-surface': '#231916',
        'outline': '#8A726B',
        'outline-variant': '#DDC0B8',
      },
      fontFamily: {
        heading: ['Fraunces_600SemiBold', 'Fraunces_400Regular', 'serif'],
        'heading-regular': ['Fraunces_400Regular', 'serif'],
        body: ['Inter_400Regular', 'sans-serif'],
        'body-medium': ['Inter_500Medium', 'sans-serif'],
        'body-semi': ['Inter_600SemiBold', 'sans-serif'],
      },
      fontSize: {
        // Display
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em' }],
        'display-lg-mobile': ['36px', { lineHeight: '42px' }],
        // Headlines (Fraunces)
        'headline-md': ['32px', { lineHeight: '40px' }],
        'headline-sm': ['24px', { lineHeight: '32px' }],
        // Body (Inter)
        'body-lg': ['18px', { lineHeight: '28px' }],
        'body-md': ['16px', { lineHeight: '24px' }],
        'body-sm': ['14px', { lineHeight: '20px' }],
        // Labels
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        // Numerals
        'numeral': ['16px', { lineHeight: '24px' }],
      },
      borderRadius: {
        card: '12px',   // Product cards, info cards
        button: '8px',  // Buttons, inputs
        pill: '9999px', // AI badges, category chips
        none: '0px',
      },
      spacing: {
        'gutter': '24px',
        'margin': '20px',
        'stack-sm': '12px',
        'stack-md': '24px',
        'stack-lg': '48px',
      },
      boxShadow: {
        // Intentionally minimal — design uses borders not shadows
        none: 'none',
        subtle: '0 1px 3px rgba(43, 36, 32, 0.05)',
      },
    },
  },
  plugins: [],
};
