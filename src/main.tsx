import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { loadRuntimeConfig } from "./lib/config.ts";

loadRuntimeConfig().then(() => {
  createRoot(document.getElementById("root")!).render(<App />);
});
