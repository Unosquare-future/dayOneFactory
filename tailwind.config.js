/** @type {import('tailwindcss').Config} */
// Editorial Blue — a minimalist editorial design system.
// Primary teal (#86C8BC) atop deep navy (#001E60), lime (#D2E146) as
// the sparing accent. Neutral surfaces live between #FFFFFF and
// #F9F9F9, with hairline outlines carrying visual hierarchy rather
// than drop shadows.
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Neutral surfaces (tonal layering — no heavy shadows)
        surface: {
          DEFAULT: '#F9F9F9',
          dim: '#DADADA',
          bright: '#F9F9F9',
          lowest: '#FFFFFF',
          low: '#F3F3F3',
          base: '#EEEEEE',
          high: '#E8E8E8',
          highest: '#E2E2E2',
        },
        ink: {
          DEFAULT: '#1A1C1C', // on-surface — primary body text on light
          soft: '#3F4946', // on-surface-variant — secondary text
          inverse: '#F0F1F1',
          mute: '#6F7976', // outline — tertiary labels & icon mutes
        },
        outline: {
          DEFAULT: '#6F7976',
          variant: '#BFC9C5',
        },
        // Brand chromatic scale
        navy: {
          DEFAULT: '#001E60', // secondary navy — headlines on light bgs, text on primary
          50: '#E8ECF5',
          100: '#DBE1FF',
          200: '#B5C4FF',
          300: '#A1B6FF',
          500: '#465B9E', // secondary per palette
          700: '#2D4384', // on-secondary-fixed-variant
          900: '#00164D', // on-secondary-fixed
        },
        teal: {
          DEFAULT: '#86C8BC', // primary-container — the signature color
          50: '#EFF8F5',
          100: '#E2F1EC',
          200: '#ACEFE3', // primary-fixed
          300: '#91D3C7', // primary-fixed-dim / inverse-primary
          500: '#24695F', // primary
          700: '#005047', // on-primary-fixed-variant
          900: '#04554C', // on-primary-container
        },
        lime: {
          DEFAULT: '#D2E146', // tertiary accent per guide
          300: '#DDED51', // tertiary-fixed
          500: '#C1D035', // tertiary-fixed-dim / tertiary-container
          700: '#5B6400', // tertiary
          900: '#444B00', // on-tertiary-fixed-variant
        },
        danger: {
          DEFAULT: '#BA1A1A',
          100: '#FFDAD6',
          900: '#93000A',
        },
      },
      fontFamily: {
        sans: ['Epilogue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['Epilogue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['Epilogue', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['Epilogue', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Editorial Blue typographic scale
        'display-lg': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['2rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        'label-bold': ['0.875rem', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '700' }],
      },
      borderRadius: {
        // Soft (0.25rem) is the default per the Editorial Blue spec.
        // Larger radii are retained for modal/hero lift.
        sm: '0.125rem',
        DEFAULT: '0.25rem',
        md: '0.375rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.25rem',
        full: '9999px',
      },
      spacing: {
        // 4px baseline rhythm
        xs: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2.5rem',
        xl: '4rem',
        gutter: '1.5rem',
        margin: '2rem',
      },
      boxShadow: {
        // Hard overlays per spec — subtle, large-radius ambient lift only
        lift: '0 1px 0 rgba(0, 30, 96, 0.04), 0 24px 48px -24px rgba(0, 30, 96, 0.18)',
        hairline: 'inset 0 0 0 1px rgba(0, 30, 96, 0.08)',
      },
      letterSpacing: {
        label: '0.08em',
      },
      keyframes: {
        bloom: {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.04)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseDot: {
          '0%,100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        bloom: 'bloom 700ms cubic-bezier(.2,.8,.2,1) both',
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
      },
    },
  },
  plugins: [],
};
