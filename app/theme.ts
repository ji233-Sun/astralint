"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily: "var(--font-geist-sans)",
  },
  palette: {
    primary: { main: "#6366f1" },
    secondary: { main: "#f59e0b" },
  },
});

export default theme;
