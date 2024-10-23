import { createContext, useContext, useMemo, useState } from "react";
import PropTypes from "prop-types";

export const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [idCliente, setIdCliente] = useState(
    localStorage.getItem("idUsuario") || 0
  );

  //Loading global
  const isLoading = (loading) => {
    setLoading(loading);
  };

  const setCliente = (cliente) => {
    setIdCliente(cliente);
    localStorage.setItem("idUsuario", cliente);
  };

  const value = useMemo(
    () => ({
      loading,
      isLoading,
      idCliente,
      setCliente,
      setIdCliente,
    }),
    [loading, idCliente]
  );

  return (
    <GlobalContext.Provider value={value}>{children}</GlobalContext.Provider>
  );
};

GlobalContextProvider.propTypes = {
  children: PropTypes.object,
};

export const useGlobalContext = () => {
  return useContext(GlobalContext);
};
