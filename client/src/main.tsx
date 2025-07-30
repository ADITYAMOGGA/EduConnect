import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/lib/theme-context";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider defaultTheme="light">
    <App />
  </ThemeProvider>
);
