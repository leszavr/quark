
const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    primary: {
      500: "#00f0ff",
    },
    secondary: {
      500: "#00ff88",
    },
    dark: {
      500: "#0f0f12",
    },
  },
  fonts: {
    heading: "Space Grotesk, -apple-system, BlinkMacSystemFont, sans-serif",
    body: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  },
});

export default theme;
