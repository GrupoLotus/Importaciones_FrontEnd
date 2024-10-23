import { useState } from "react";
import ClienteHttp from "../../../connection/ClienteHttp";
import { useForm } from "../../../hooks/useForm";
import { Alert } from "../../ui/Alert";
import { infoMensajes, defError, endPoint } from "../../../types/definiciones";
import { Button, Offcanvas } from "react-bootstrap";
import { useAuthContext } from "../../../connection/authContext";
import { useGlobalContext } from "../../../connection/globalContext";
import LogoLogin from "../../img/LogoLogin.svg";
import LogoRecupera from "../../img/LogoRecupera.svg";
import { toast } from "react-toastify";
import { Grid } from "antd";

// Función para enviar eventos a Google Analytics
const sendAnalyticsEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};

export const Login = () => {
  //Recuperar contexto para logear y renderizar el Contexto
  const { isLoading } = useGlobalContext();
  const { login } = useAuthContext();
  const [valueLoading, setValueLoading] = useState(false);
  const [valuesForm, handleInputChange] = useForm({
    usuario: "",
    clave: "",
    tipoCone: false,
  });
  const [timeoutId, setTimeoutId] = useState(null);
  const respuestaOK = { codigo: 200, mensaje: "" };
  const [valorRespuesta, setValorRespuesta] = useState(respuestaOK);
  const { mensaje: mensajeRespuesta } = valorRespuesta;
  const { codigo: codigoRespuesta } = valorRespuesta;

  const [btnLogout, setBtnLogout] = useState(false);
  const { useBreakpoint } = Grid;
  const { lg } = useBreakpoint();

  const invocarTimeOut = () => {
    // Cancelar el timeout anterior
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Crear un nuevo timeout para ocultar alerta
    const newTimeoutId = setTimeout(() => {
      setValorRespuesta((valor) => (valor = respuestaOK));
    }, 5000);

    setTimeoutId(newTimeoutId);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      iniciarSesion();
    }
  };

  //Metodo para iniciar sesion
  const iniciarSesion = async () => {
    setValorRespuesta((valor) => (valor = respuestaOK));
    setValueLoading(!valueLoading);
    isLoading(true);

    valuesForm.tipoCone = btnLogout;
    const json = JSON.stringify(valuesForm);

    await ClienteHttp.post(endPoint.baseURL + endPoint.login, json)
      .then(({ data }) => {
        login(data);
        sendAnalyticsEvent("Login Exitoso", { usuario: json.usuario });
      })
      .catch((error) => {
        invocarTimeOut();
        setValorRespuesta({
          codigo: 500,
          mensaje: error.response.data.mensaje || error.response.data.message,
        });
        if (error.response.data.codigo === 403) {
          setBtnLogout(true);
        }
        sendAnalyticsEvent("Login Fallido", {
          error_type: error.response.data.codigo,
          error_message:
            error.response.data.mensaje || error.response.data.message,
        });
      })
      .finally(() => {
        isLoading(false);
        setValueLoading(!valuesForm);
      });
  };

  const estadoInicial = {
    emailUsuario: "",
  };
  const [show, setShow] = useState(false);
  const [valoresForm, setValoresForm, restablecerForm] = useForm(estadoInicial);

  const onSubmitRecuperarClave = async (e) => {
    e.preventDefault();
    const json = JSON.stringify(valoresForm);

    await ClienteHttp.post(
      endPoint.baseURL + endPoint.login + endPoint.recuperaClave,
      json
    )
      .then(({ data }) => {
        toast.success(data.mensaje);
        setShow(false);
        restablecerForm();
        sendAnalyticsEvent("Recupera Clave Exitoso", {
          usuario: json.emailUsuario,
        });
      })
      .catch((err) => {
        if (err.message === defError.errorServer) {
          toast.error(infoMensajes.errorDeComunicacion);
        } else {
          if (err.response?.data?.mensaje) {
            toast.error(err.response.data.mensaje);
          } else {
            toast.error(err?.mensaje);
          }
        }
        sendAnalyticsEvent("Recupera Clave Exitoso", {
          error_message:
            err.message || err.response?.data?.mensaje || "error desconocido",
        });
      });
  };

  return (
    <section className="vh-100">
      <div className="container py-5 h-100">
        <div className="row d-flex align-items-center justify-content-center h-100">
          <div className="col-md-8 col-lg-7 col-xl-6 text-center">
            <img src={LogoLogin} className="img-fluid" alt="" />
          </div>
          <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
            <form onKeyDown={handleKeyDown}>
              <h2 className="text-center LoginCard">BIENVENIDO</h2>
              <Alert mensaje={mensajeRespuesta} codigo={codigoRespuesta} />
              <div className="form-floating mb-3">
                <input
                  type="text"
                  name="usuario"
                  id="usuario"
                  className="form-control"
                  onChange={handleInputChange}
                  autoComplete="off"
                  required={true}
                  placeholder="usuario"
                  disabled={btnLogout}
                />
                <label htmlFor="usuario">Usuario</label>
              </div>
              <div className="form-floating">
                <input
                  type="password"
                  name="clave"
                  id="clave"
                  className="form-control"
                  onChange={handleInputChange}
                  placeholder="Contraseña"
                  autoComplete="off"
                  required={true}
                  disabled={btnLogout}
                />
                <label htmlFor="clave">Contraseña</label>
              </div>
              <div className="text-end mt-3">
                <label onClick={() => setShow(true)}>
                  ¿Olvido su contraseña?
                </label>
              </div>
              <div className="d-grid gap-2 col-6 mx-auto mt-4">
                <button
                  className={btnLogout ? "btn btn-danger" : "btn btn-primary"}
                  type="button"
                  disabled={!valueLoading ? false : true}
                  onClick={iniciarSesion}
                >
                  <span
                    className={
                      valueLoading ? "spinner-border spinner-border-sm" : ""
                    }
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {btnLogout
                    ? "Conectar en este dispositivo"
                    : !valueLoading
                    ? "Iniciar sesion"
                    : "Iniciando sesion..."}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/*OffCanvas pantalla completa para recuperacion de contraseña*/}
        <Offcanvas
          show={show}
          onHide={() => setShow(!show)}
          style={{
            width: lg ? "600px" : "70%",
          }}
        >
          <Offcanvas.Header closeButton>
            <div className="w-100 text-center">
              <h3>Recuperación de contraseña</h3>
            </div>
          </Offcanvas.Header>
          {/*<Offcanvas.Body className="d-flex flex-column align-items-center justify-content-center">*/}
          <Offcanvas.Body className="d-flex flex-column align-items-center">
            <div className="text-center mb-4">
              <img src={LogoRecupera} width="250" alt="" className="mb-1" />
            </div>

            <p className="text-center mb-3">
              Ingrese usuario o correo registrado. Las instrucciones de
              recuperación de contraseña se enviarán al correo electrónico
              especificado.
            </p>
            <form className="w-100" onSubmit={onSubmitRecuperarClave}>
              <div className="col-sm-10 offset-sm-1 mb-3">
                <input
                  type="text"
                  className="form-control "
                  id="emailUsuario"
                  name="emailUsuario"
                  placeholder="Correo electrónico o usuario"
                  onChange={setValoresForm}
                  required
                />
              </div>
              <div className="text-center">
                <Button
                  style={{ width: "auto" }}
                  variant="primary"
                  type="submit"
                >
                  Recuperar contraseña
                </Button>
              </div>
            </form>
          </Offcanvas.Body>
        </Offcanvas>
      </div>
    </section>
  );
};
