import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.js";
import { ReactQueryProvider } from "./lib/query-client.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReactQueryProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ReactQueryProvider>
  </React.StrictMode>
);
