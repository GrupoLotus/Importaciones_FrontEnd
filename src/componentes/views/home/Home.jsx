//import React from "react";
import LogoPrincipal from "../../img/LogoPrincipal.svg";
import "../../../styles/Layout.css";

export const Home = () => {
  return (
    <div className="container-menu" style={{ overflow: "hidden" }}>
      <img src={LogoPrincipal} alt="Imagen" className="image-menu" />
    </div>
  );
};
