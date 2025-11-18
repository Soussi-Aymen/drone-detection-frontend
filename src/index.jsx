import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app.jsx";
import "./index.css";

// The application's entry point, mounting the App component to the DOM.
const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
