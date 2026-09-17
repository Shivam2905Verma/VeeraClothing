import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./App.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import MainContextProvider from "./main/context/MainContext.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <MainContextProvider>
      <App />
    </MainContextProvider>
  </BrowserRouter>,
);
