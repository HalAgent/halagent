import { defineConfig, presetUno, presetAttributify, presetIcons } from 'unocss';

export default defineConfig({
  shortcuts: [
    ['frc-center', 'flex flex-row items-center justify-center'],
    ['fcc-center', 'flex flex-col items-center justify-center'],
    ['frc-start', 'flex flex-row items-center justify-start'],
    ['page','flex flex-col justify-start items-center w-full h-full']
  ],
  theme: {
    colors: {
      primary: '#3b82f6',
      'primary-dark': '#2563eb',
    },
    animation: {
      keyframes: {
        'fade-in': '{0%:{opacity:0;transform:translateY(10px)}100%:{opacity:1;transform:translateY(0)}}',
      },
      durations: {
        'fade-in': '0.3s',
      },
      timingFns: {
        'fade-in': 'ease-out',
      },
    },
  },
  presets: [presetUno(), presetAttributify(), presetIcons()],
});
