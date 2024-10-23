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
const pantallaComponente = ["IMPORTACION", "IMPORTACIONES", "Importación"];

// Función para enviar eventos a Google Analytics
const sendAnalyticsEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};
const campoAnalytics = "Importacion";
const campoPrincipal = "bl";

export const Importacion = () => {
  const { md } = useBreakpoint();

  const { isLoading } = useGlobalContext();
  const estadoInicialForm = {
    bl: "",
    embarcador: "",
    consignatario: "",
    fechaSalida: "",
    contenedor: "",
    barco: "",
    puertoOrigen: "",
    puertoDestino: "",
    fechaArribo: "",
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
    Finalizados: false,
  };
  const [filtrosTabla, setFiltrosTabla] = useForm(filtrosTablaDefault);
  const switchesTabla = [
    {
      Eliminados: false,
      Activos: true,
      Finalizados: false,
    },
  ];
  const [filtroSeleccionados, setFiltroSeleccionados] = useState("");

  const limpiezaForm = () => {
    setShowModalCRUD(!showModalCRUD);
    restablecerForm();
  };

  //Evento Submit
  const onSubmit = async (e) => {
    let tipoCRUD = estadoIniCRUDmodal.tipoCRUD;
    if (estadoIniCRUDmodal.tipoSubmit === "cambiarEtapa") {
      //El evento de submit es para cambiar de etapa de setea a 4
      tipoCRUD = 4;
    }
    e.preventDefault();
    isLoading(true);
    switch (tipoCRUD) {
      case 1: //Crear Registro
        if (valoresForm.puertoOrigen === valoresForm.puertoDestino) {
          toast.error("Puerto de origen y destinos son iguales, favor válidar");
          isLoading(false);
          sendAnalyticsEvent(`${campoAnalytics} Puertos Iguales Crea`);
          return;
        }

        if (valoresForm.fechaArribo < valoresForm.fechaSalida) {
          toast.error("Fecha de arribo no puede ser menor a la de salida");
          isLoading(false);
          sendAnalyticsEvent(`${campoAnalytics} Fechas Incorrectas Crea`);
          return;
        }
        const json = JSON.stringify(valoresForm);
        try {
          const { data } = await ClienteHttp.post(
            endPoint.baseURL + endPoint.modImport + endPoint.import,
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
        if (valoresForm.puertoOrigen === valoresForm.puertoDestino) {
          toast.error("Puerto de origen y destinos son iguales, favor válidar");
          isLoading(false);
          sendAnalyticsEvent(`${campoAnalytics} Puertos Iguales Modifica`);
          return;
        }

        if (valoresForm.fechaArribo < valoresForm.fechaSalida) {
          toast.error("Fecha de arribo no puede ser menor a la de salida");
          isLoading(false);
          sendAnalyticsEvent(`${campoAnalytics} Fechas Incorrectas Modifica`);
          return;
        }
        const jsonUpdate = JSON.stringify(valoresForm);
        try {
          const { data } = await ClienteHttp.put(
            endPoint.baseURL + endPoint.modImport + endPoint.import,
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
              endPoint.modImport +
              endPoint.import +
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
      case 4: //Cambiar de etapa
        try {
          const { data } = await ClienteHttp.put(
            endPoint.baseURL +
              endPoint.modImport +
              endPoint.import +
              endPoint.cambioEtapa +
              `/${estadoIniCRUDmodal.id}`
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
        });
        setShowModalCRUD(!showModalCRUD);
        isLoading(false);
        break;
      case 2: //Modificar || Leer Registro
        sendAnalyticsEvent(
          `${campoAnalytics} Modal ${option === 2 ? "Modifica" : "Consulta"}`
        );
        setEstadoIniCRUDmodal({
          id,
          tipoCRUD: option,
          tituloModal:
            (option === 2 ? "MODIFICAR" : "CONSULTAR") +
            ` ${pantallaComponente[0]}`,
          tituloBoton:
            option === 2 ? `Modificar ${pantallaComponente[2]}` : "N/A",
          tituloBoton2:
            option === 2 ? `Finalizar ${pantallaComponente[2]}` : "",
          fila,
        });

        //Peticion para consulta el ID del rol y extraer la informacion
        try {
          const { data } = await ClienteHttp.get(
            endPoint.baseURL + endPoint.modImport + endPoint.import + `/${id}`
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
          usuario: fila.BL,
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
          endPoint.modImport +
          endPoint.import +
          endPoint.epConsulta +
          filtro
      );
      setInformacion(data.respuesta);

      //ESPACIO PARA ARREGLOS
      let newObjeto = "";
      let arraySelect = {};

      newObjeto = data.respuesta.valSelect.Puerto.map((obj) => {
        return {
          value: obj.id,
          descripcion: obj.nombre,
        };
      });

      arraySelect = {
        ...arraySelect,
        puertoOrigen: newObjeto,
        puertoDestino: newObjeto,
      };

      setSelectBox(arraySelect);
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
      filtrosTabla.Finalizados && (valores = valores + "F");
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
