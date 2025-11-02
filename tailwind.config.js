module.exports = {
  content: [
    './infra/quark-ui/**/*.{ts,tsx}',
    './apps/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Добавь свою палитру из Chakra UI здесь
      },
    },
  },
  plugins: [],
};