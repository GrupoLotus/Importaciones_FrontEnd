import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import { types, endPoint } from "../types/definiciones";
import ClienteHttp from "./ClienteHttp";
import { useGlobalContext } from "./globalContext";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(
    localStorage.getItem(types.nombreToken)
  );
  const [datosUsuario, setDatosUsuario] = useState({ rutas: [] });
  const { isLoading, setCliente } = useGlobalContext();

  const recuperaSesion = useCallback(async () => {
    isLoading(true);
    await ClienteHttp.get(
      endPoint.baseURL + endPoint.login + endPoint.usuariosSesion
    )
      .then(({ data }) => {
        setDatosUsuario(data);
        setCliente(data.usuario);
      })
      .catch((err) => {
        window.localStorage.removeItem("x-token");
        setIsLogged(false);
      })
      .finally(() => {
        isLoading(false);
      });
  }, []);

  //Hook para realizar una sola peticion a backend de recuperacion de sesion
  useEffect(() => {
    if (isLogged) {
      recuperaSesion();
    }
  }, [recuperaSesion, isLogged]);

  //Aca debe ir la autenticacion si el usuario esta conectado y tiene token valido
  const login = useCallback((data) => {
    const { token } = data;
    window.localStorage.setItem("x-token", token);
    setDatosUsuario(data);
    setCliente(data.usuario);
    setIsLogged(true);
  }, []);

  //Metodo para cerrar sesion
  const loginOut = useCallback(async () => {
    const { usuario } = datosUsuario;
    const json = JSON.stringify({ usuario });
    isLoading(true);
    await ClienteHttp.post(
      endPoint.baseURL + endPoint.login + "/" + usuario,
      json
    )
      .then((response) => {
        window.localStorage.removeItem("x-token");
        setIsLogged(false);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        isLoading(false);
      });
  }, [datosUsuario]);

  const value = useMemo(
    () => ({
      login,
      loginOut,
      isLogged,
      setIsLogged,
      datosUsuario,
    }),
    [datosUsuario, isLogged, login, loginOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthContextProvider.propTypes = {
  children: PropTypes.object,
};

export const useAuthContext = () => {
  return useContext(AuthContext);
};
