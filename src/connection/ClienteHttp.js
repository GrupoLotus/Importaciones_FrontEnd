import axios from "axios";
import {
  defError,
  endPoint,
  infoMensajes,
  datosReload,
} from "../types/definiciones";
import { toast } from "react-toastify";

axios.defaults.baseURL = endPoint.baseURL;
axios.interceptors.request.use(
  (config) => {
    //const token = window.localStorage.getItem("x-token");

    return config;
  },
  (error) => {
    return null;
  }
);

const requestPersonalizado = {
  get: (url) => {
    return axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        "x-token": window.localStorage.getItem("x-token"),
      },
    });
  },
  post: (url, body) => {
    return axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
        "x-token": window.localStorage.getItem("x-token"),
      },
    });
  },
  put: (url, body) => {
    return axios.put(url, body, {
      headers: {
        "Content-Type": "application/json",
        "x-token": window.localStorage.getItem("x-token"),
      },
    });
  },
  delete: (url) => {
    return axios.delete(url, {
      headers: {
        "Content-Type": "application/json",
        "x-token": window.localStorage.getItem("x-token"),
      },
    });
  },
  postfile: (url, body) => {
    return axios.post(url, body, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-token": window.localStorage.getItem("x-token"),
      },
    });
  },
  getFile: (url) => {
    return axios.get(url, {
      headers: {
        "Content-Type": "multipart/form-data",
        "x-token": window.localStorage.getItem("x-token"),
      },
      responseType: "blob",
    });
  },
  download: (url, fileName) => {
    return axios({
      url: url,
      method: "GET",
      responseType: "blob",
      headers: {
        "x-token": window.localStorage.getItem("x-token"),
      },
    }).then((response) => {
      // create file link in browser's memory
      const href = URL.createObjectURL(response.data);
      // create "a" HTML element with href to file & click
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", fileName); //or any other extension
      document.body.appendChild(link);
      link.click();
      // clean up "a" element & remove ObjectURL
      document.body.removeChild(link);
      URL.revokeObjectURL(href);
      return true;
    });
  },
};

export const errorRequest = (err) => {
  if (
    err.response?.statusText === datosReload.statusText ||
    err.response?.status === datosReload.statusAutorized
  ) {
    toast.error(
      err.response.data.mensaje ||
        "Tu sesión ha expirado. Serás redirigido a la página principal."
    );
    setTimeout(() => {
      window.location.reload(true);
      window.location.href = datosReload.urlHome;
    }, datosReload.setTime);
  } else if (err.message === defError.errorServer) {
    toast.error(infoMensajes.errorDeComunicacion);
  } else if (err.message === defError.internalServerError) {
    toast.error(infoMensajes.algoSalioMal);
  } else if (err.response?.data?.errors) {
    toast.error(err.response?.data?.errors[0].msg);
  } else {
    toast.error(err.response?.data?.mensaje ?? `Error no definido: ${err}`);
  }
};

export default requestPersonalizado;
