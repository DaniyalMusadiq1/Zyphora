// // Zyphora Design System
// export const Colors = {
//   // Brand
//   primary: '#7C3AED',   // Zyphora Purple
//   secondary: '#2D2B55', // Deep Purple
//   accent: '#00F0FF',    // Zyphora Teal/Cyan
  
//   // Backgrounds
//   bg: '#0F0F1A',        // Almost black
//   card: '#1A1A2E',      // Dark Blue/Grey
//   input: '#141428',     // Input background
  
//   // Text
//   text: '#FFFFFF',
//   textMuted: '#9CA3AF',
//   error: '#EF4444',
//   success: '#10B981',
  
//   // Gradients
//   gradientStart: '#2D2B55',
//   gradientEnd: '#1A1A2E',
// };

// export const Typography = {
//   // Using system fonts for performance, but styled with weights
//   h1: { fontSize: 32, fontWeight: '700', lineHeight: 40, color: Colors.text },
//   h2: { fontSize: 24, fontWeight: '600', lineHeight: 32, color: Colors.text },
//   h3: { fontSize: 20, fontWeight: '600', lineHeight: 28, color: Colors.text },
//   body: { fontSize: 16, fontWeight: '400', lineHeight: 24, color: Colors.textMuted },
//   caption: { fontSize: 14, fontWeight: '400', lineHeight: 20, color: Colors.textMuted },
//   mono: { fontFamily: 'monospace', fontSize: 14, color: Colors.accent },
// };

// export const Spacing = {
//   xs: 4,
//   sm: 8,
//   md: 16,
//   lg: 24,
//   xl: 32,
// };

// export const BorderRadius = {
//   sm: 8,
//   md: 12,
//   lg: 16,
//   xl: 24,
//   full: 9999,
// };


// Zyphora Design System — v2 updated to match design
export const Colors = {
  // Brand
  primary: '#7C3AED',
  secondary: '#2D2B55',

  // Design-system base
   b0: '#070B14',
  b1: '#0C1120',
  b2: '#111827',
  b3: '#1C2333',
  b4: '#243044',
  // Aliases for existing code
  bg: '#070B14',
  card: '#111827',
  input: '#1C2333',

  // Text
  text: '#FFFFFF',
  textMuted: 'rgba(255,255,255,0.5)',
  textDim: 'rgba(255,255,255,0.3)',
  textLight: 'rgba(255,255,255,0.7)',

  // Lines / dividers
  line: 'rgba(255,255,255,0.07)',
  line2: 'rgba(255,255,255,0.12)',


  // Accents
  accent: '#00F0FF',
  up: '#34D399',
  down: '#F87171',


  // Alpha whites

  w: '#FFFFFF',
  w90: 'rgba(255,255,255,0.9)',
  w70: 'rgba(255,255,255,0.7)',
  w50: 'rgba(255,255,255,0.5)',
  w30: 'rgba(255,255,255,0.3)',
  w15: 'rgba(255,255,255,0.15)',
  w08: 'rgba(255,255,255,0.08)',
  w04: 'rgba(255,255,255,0.04)',

  // Status
  gold: '#F59E0B',
  error: '#F87171',
  success: '#34D399',
  // Gradients
  gradientStart: '#1C2333',
  gradientEnd: '#111827',
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700', lineHeight: 36, color: '#FFFFFF' },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 30, color: '#FFFFFF' },
  h3: { fontSize: 18, fontWeight: '600', lineHeight: 26, color: '#FFFFFF' },
  body: { fontSize: 14, fontWeight: '400', lineHeight: 22, color: 'rgba(255,255,255,0.7)' },
  caption: { fontSize: 12, fontWeight: '400', lineHeight: 18, color: 'rgba(255,255,255,0.5)' },
  mono: { fontFamily: 'monospace', fontSize: 14, color: '#00F0FF' },
};



export const Spacing = { xs:4, sm:8, md:16, lg:24, xl:32 };
export const BorderRadius = { sm:8, md:12, lg:16, xl:24, full:9999 };

// A simple Tailwind‑like style helper (no extra libs)
export const tw = (styles) => styles;