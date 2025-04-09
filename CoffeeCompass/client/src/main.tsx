import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "./custom.css"; // Import our custom coffee-themed styles

createRoot(document.getElementById("root")!).render(<App />);