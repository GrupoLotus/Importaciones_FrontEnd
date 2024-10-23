import { useEffect, useState } from "react";
import { useGlobalContext } from "../../../connection/globalContext";
import { useForm } from "../../../hooks/useForm";
import ClienteHttp, { errorRequest } from "../../../connection/ClienteHttp";
import { endPoint } from "../../../types/definiciones";
import { Grid, Button, Card, Row, Col } from "antd";
import { PlusSquareFilled } from "@ant-design/icons";
import TableUI from "../../ui/TableUI";
import { ModalMaestro } from "../../ui/ModalMaestro";
import { caseDefaultClick, caseDefaultSubmit } from "../../ui/GeneralMessage";
import { toast } from "react-toastify";

const { useBreakpoint } = Grid;
const pantallaComponente = ["USUARIO", "USUARIOS", "Usuario"];

// Función para enviar eventos a Google Analytics
const sendAnalyticsEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};
const campoAnalytics = "Usuario";
const campoPrincipal = "usuario";

export const Usuario = () => {
  const { md } = useBreakpoint();
  const { isLoading } = useGlobalContext();
  const estadoInicialForm = {
    id: "",
    usuario: "",
    nombre: "",
    apellidos: "",
    dpi: "",
    correo: "",
    puesto: "",
    rol: "",
    conectado: "",
    estado: "",
  };
  const estadoInicialModal = {
    tituloModal: `${pantallaComponente[0]}`,
    tipoCRUD: 1,
    tituloBoton: `Crear ${pantallaComponente[2]}`,
    fila: {},
  };
  const [valoresForm, setValoresForm, restablecerForm, setearUpdateForm] =
    useForm(estadoInicialForm);
  const [estadoIniCRUDmodal, setEstadoIniCRUDmodal] =
    useState(estadoInicialModal);
  const [showModalCRUD, setShowModalCRUD] = useState(false);
  const [informacion, setInformacion] = useState([{}]);
  const [selectBox, setSelectBox] = useState([{}]);
  const filtrosTablaDefault = {
    Eliminados: false,
    Activos: true,
    Bloqueados: false,
  };
  const [filtrosTabla, setFiltrosTabla] = useForm(filtrosTablaDefault);
  const switchesTabla = [
    {
      Eliminados: false,
      Activos: true,
      Bloqueados: false,
    },
  ];
  const [filtroSeleccionados, setFiltroSeleccionados] = useState("");

  const limpiezaForm = () => {
    setShowModalCRUD(!showModalCRUD);
    restablecerForm();
  };

  //Evento Submit
  const onSubmit = async (e) => {
    e.preventDefault();
    isLoading(true);
    switch (estadoIniCRUDmodal.tipoCRUD) {
      case 1: //Crear Registro
        const json = JSON.stringify(valoresForm);
        try {
          const { data } = await ClienteHttp.post(
            endPoint.baseURL + endPoint.modulo + endPoint.usuarios,
            json
          );
          toast.success(data.mensaje);
          limpiezaForm();
          await recuperaInformacion(filtroSeleccionados);
          sendAnalyticsEvent(`${campoAnalytics} Crea Exitoso`, {
            dato: valoresForm[campoPrincipal],
          });
        } catch (error) {
          errorRequest(error);
          sendAnalyticsEvent(`${campoAnalytics} Crea Fallido`, {
            error:
              error.response.data.errors ||
              error.response.data.mensaje ||
              "Error desconocido",
          });
        } finally {
          isLoading(false);
        }
        break;
      case 2: //Modificar Registro
        const jsonUpdate = JSON.stringify(valoresForm);
        try {
          const { data } = await ClienteHttp.put(
            endPoint.baseURL + endPoint.modulo + endPoint.usuarios,
            jsonUpdate
          );
          toast.success(data.mensaje);
          limpiezaForm();
          await recuperaInformacion(filtroSeleccionados);
          sendAnalyticsEvent(`${campoAnalytics} Modifica Exitoso`, {
            dato: valoresForm[campoPrincipal],
          });
        } catch (error) {
          errorRequest(error);
          sendAnalyticsEvent(`${campoAnalytics} Modifica Fallido`, {
            error:
              error.response.data.errors ||
              error.response.data.mensaje ||
              "Error desconocido",
          });
        } finally {
          isLoading(false);
        }
        break;
      case 3: //Eliminar Registro
        try {
          const { data } = await ClienteHttp.delete(
            endPoint.baseURL +
              endPoint.modulo +
              endPoint.usuarios +
              `/${estadoIniCRUDmodal.fila.ID}`
          );
          toast.success(data.mensaje);
          limpiezaForm();
          await recuperaInformacion(filtroSeleccionados);
          sendAnalyticsEvent(`${campoAnalytics} Elimina Exitoso`, {
            dato: estadoIniCRUDmodal.usuario,
          });
        } catch (error) {
          errorRequest(error);
          sendAnalyticsEvent(`${campoAnalytics} Elimina Fallido`, {
            error:
              error.response.data.errors ||
              error.response.data.mensaje ||
              "Error desconocido",
          });
        } finally {
          isLoading(false);
        }
        break;
      case 4: //Restablecer contraseña usuario
        const jsonRest = JSON.stringify({
          emailUsuario: estadoIniCRUDmodal.fila.USUARIO,
        });
        try {
          const { data } = await ClienteHttp.post(
            endPoint.baseURL + endPoint.login + endPoint.recuperaClave,
            jsonRest
          );
          toast.success(data.mensaje);
          limpiezaForm();
          await recuperaInformacion(filtroSeleccionados);
          sendAnalyticsEvent(`${campoAnalytics} Recupera Clave Exitoso`, {
            dato: estadoIniCRUDmodal.fila.USUARIO,
          });
        } catch (error) {
          errorRequest(error);
          sendAnalyticsEvent(`${campoAnalytics} Recupera Clave Fallido`, {
            error:
              error.response.data.errors ||
              error.response.data.mensaje ||
              "Error desconocido",
          });
        } finally {
          isLoading(false);
        }
        break;
      default:
        isLoading(false);
        toast.warning(caseDefaultSubmit);
        sendAnalyticsEvent(`${campoAnalytics} Acción Desconocida`);
        break;
    }
  };

  //Manejador de botones en tabla para manejo de estados
  const onClickAccion = async (option, id = 0, fila = "") => {
    if (id === 0 && (option === 2 || option === 3)) {
      return 0;
    }
    isLoading(true);
    const optionTemp = option === 5 ? 2 : option;
    switch (optionTemp) {
      case 1: //Crear Registro
        sendAnalyticsEvent(`${campoAnalytics} Modal Crea`);
        setEstadoIniCRUDmodal({
          tipoCRUD: 1,
          tituloModal: `CREAR ${pantallaComponente[0]}`,
          tituloBoton: `Crear ${pantallaComponente[2]}`,
          fila,
          tamanoModal: "lg",
        });
        setShowModalCRUD(!showModalCRUD);
        isLoading(false);
        break;
      case 2: //Modificar || Leer Registro
        sendAnalyticsEvent(
          `${campoAnalytics} Modal ${option === 2 ? "Modifica" : "Consulta"}`
        );
        setEstadoIniCRUDmodal({
          tipoCRUD: option,
          tituloModal:
            (option === 2 ? "MODIFICAR" : "CONSULTAR") +
            ` ${pantallaComponente[0]}`,
          tituloBoton:
            option === 2 ? `Modificar ${pantallaComponente[2]}` : "N/A",
          fila,
          tamanoModal: "lg",
        });

        //Peticion para consulta el ID del rol y extraer la informacion
        try {
          const { data } = await ClienteHttp.get(
            endPoint.baseURL + endPoint.modulo + endPoint.usuarios + `/${id}`
          );
          setearUpdateForm(data.respuesta);
          setShowModalCRUD(!showModalCRUD);
          sendAnalyticsEvent(`${campoAnalytics} Muestra Registros Exitoso`);
        } catch (error) {
          errorRequest(error);
          sendAnalyticsEvent(`${campoAnalytics} Muestra Registros Fallido`, {
            error:
              error.response.data.errors ||
              error.response.data.mensaje ||
              "Error desconocido",
          });
        } finally {
          isLoading(false);
        }
        break;
      case 3: //Eliminar Registro
        sendAnalyticsEvent(`${campoAnalytics} Modal Elimina`);
        setEstadoIniCRUDmodal({
          tipoCRUD: 3,
          tituloModal: `ELIMINAR ${pantallaComponente[0]}`,
          tituloBoton: `Eliminar ${pantallaComponente[2]}`,
          usuario: fila.USUARIO,
          fila,
        });
        setShowModalCRUD(!showModalCRUD);
        isLoading(false);
        break;
      case 4: //Restabelcer contraseña usuario
        sendAnalyticsEvent(`${campoAnalytics}_restablece_clave_modal`);
        setEstadoIniCRUDmodal({
          tipoCRUD: 4,
          tituloModal: "Restablecimiento de contraseña",
          tituloBoton: "Restablecer contraseña",
          usuario: fila.USUARIO,
          fila,
        });
        setShowModalCRUD(!showModalCRUD);
        isLoading(false);
        break;
      default:
        isLoading(false);
        toast.warning(caseDefaultClick);
        sendAnalyticsEvent(`${campoAnalytics} OnClick Incorrecto`);
        break;
    }
  };

  //Peticion para pintar READ tabla o inpunt
  const recuperaInformacion = async (filtro) => {
    isLoading(true);
    try {
      const { data } = await ClienteHttp.get(
        endPoint.baseURL +
          endPoint.modulo +
          endPoint.usuarios +
          endPoint.epConsulta +
          filtro
      );
      setInformacion(data.respuesta);
      setSelectBox(data.respuesta.valoresSelectBox);
      sendAnalyticsEvent(`${campoAnalytics} Tabla Exitoso`, {
        filtro: filtro,
        cantidad: data.respuesta.length,
      });
    } catch (error) {
      errorRequest(error);
      sendAnalyticsEvent(`${campoAnalytics} Tabla Fallido`, {
        error:
          error.response.data.errors ||
          error.response.data.mensaje ||
          "Error desconocido",
      });
    } finally {
      isLoading(false);
    }
  };

  //Ejecutar peticion cada vez que cambie un filtro de tabla
  useEffect(() => {
    const pintaUsuarioFiltros = async () => {
      let valores = "";
      filtrosTabla.Activos && (valores = valores + "A");
      filtrosTabla.Eliminados && (valores = valores + "N");
      filtrosTabla.Bloqueados && (valores = valores + "B");
      if (valores === "") {
        valores = "Z";
      }
      setFiltroSeleccionados(valores);
      await recuperaInformacion(valores);
      sendAnalyticsEvent(`${campoAnalytics} Cambio Filtro`, {
        nuevoFiltro: valores,
      });
    };
    pintaUsuarioFiltros();
  }, [filtrosTabla]);

  return (
    <>
      <Card style={{ width: "100%", backgroundColor: "#011d38", border: 0 }}>
        <Row align="middle" justify="space-between">
          <Col
            xs={22}
            offset={md ? 8 : 0}
            md={8}
            style={{ textAlign: "center" }}
          >
            <h3>{pantallaComponente[1]}</h3>
          </Col>
          <Col xs={2} md={8} style={{ textAlign: "right" }}>
            <Button
              type="default"
              onClick={() => onClickAccion(1)}
              icon={<PlusSquareFilled />}
            >
              {md ? `Crear ${pantallaComponente[2]}` : ""}
            </Button>
          </Col>
        </Row>
      </Card>

      <TableUI
        tabla={informacion.tabla}
        onClicActions={onClickAccion}
        pantalla={pantallaComponente[1]}
        filtros={filtrosTabla}
        setFiltros={setFiltrosTabla}
        switches={switchesTabla}
        pantallaFiltros={pantallaComponente[1]}
      />

      {showModalCRUD && (
        <ModalMaestro
          showHide={showModalCRUD}
          limpiezaForm={limpiezaForm}
          onSubmit={onSubmit}
          inputs={informacion.CRUD}
          setValoresForm={setValoresForm}
          valoresForm={valoresForm}
          valoresSelect={selectBox}
          opCRUDModal={estadoIniCRUDmodal}
          setEstadoIniCRUDmodal={setEstadoIniCRUDmodal}
        />
      )}
    </>
  );
};
