import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { AuthContextProvider } from "./connection/authContext";
import { GlobalContextProvider } from "./connection/globalContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <GlobalContextProvider>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </GlobalContextProvider>
);
