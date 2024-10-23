import { useEffect, useState } from "react";
import { useGlobalContext } from "../../../connection/globalContext";
import { useForm } from "../../../hooks/useForm";
import ClienteHttp, { errorRequest } from "../../../connection/ClienteHttp";
import { endPoint } from "../../../types/definiciones";
import { Grid, Card, Row, Col } from "antd";
import TableUI from "../../ui/TableUI";
import { caseDefaultClick, caseDefaultSubmit } from "../../ui/GeneralMessage";
import { toast } from "react-toastify";
import {
  Button as ButtonRB,
  Form,
  Modal,
  ModalFooter,
  Row as RowRB,
} from "react-bootstrap";
import { VisualizePDF } from "../../ui/VisualizePDF";
import { IconButton, Tooltip } from "@mui/material";

const { useBreakpoint } = Grid;
const pantallaComponente = ["MANUAL", "MANUALES", "Manual"];

const api_endpoint = endPoint.baseURL + endPoint.modAyuda + endPoint.manual;
const api_endpointFile =
  endPoint.baseURL +
  endPoint.modArchivo +
  endPoint.upDownPDF +
  endPoint.fileManual;

// Función para enviar eventos a Google Analytics
const sendAnalyticsEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};
const campoAnalytics = "Manuales";
const campoPrincipal = "nombre";

export const Manuales = () => {
  const { md } = useBreakpoint();
  const { isLoading } = useGlobalContext();
  const estadoInicialForm = {
    nombre: "",
    descripcion: "",
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

  const [showHideAdjuntar, setShowHideAdjuntar] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);

  const limpiezaFormAdjuntar = () => {
    setShowHideAdjuntar(false);
    restablecerForm();
  };

  const descargaPDF = async (id = 0) => {
    isLoading(true);
    try {
      const response = await ClienteHttp.getFile(api_endpointFile + `/${id}`);

      // Asumiendo que la respuesta contiene los datos del archivo directamente
      const contentType = response.headers["content-type"];
      const blob = new Blob([response.data], { type: contentType });
      setPdfBlob(blob);

      sendAnalyticsEvent(`${campoAnalytics} Descarga Archivo Exitoso`, {
        dato: estadoIniCRUDmodal.id,
      });
    } catch (error) {
      let errorMessage = "Error desconocido";
      if (error.response) {
        errorMessage = error.response.data.errors
          ? error.response.data.errors[0].msg
          : error.response.data.mensaje || errorMessage;
      } else if (error.message === defError.errorServer) {
        errorMessage = infoMensajes.errorDeComunicacion;
      }

      errorRequest(error);
      toast.error(errorMessage);

      sendAnalyticsEvent(`${campoAnalytics} Descarga Archivo Fallido`, {
        error: errorMessage,
      });
    } finally {
      isLoading(false);
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
      case 6: //Carga de archivos pdf
        setEstadoIniCRUDmodal({
          tipoCRUD: 6,
          nombreArchivo: fila.NOMBRE_ARCHIVO,
          tituloModal: "Carga de archivo",
          tituloBoton: "Guardar",
          id: id,
        });
        if (fila.NOMBRE_ARCHIVO != "") {
          await descargaPDF(id);
        }
        setShowHideAdjuntar(true);
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
        api_endpoint + endPoint.epConsulta + filtro
      );
      setInformacion(data.respuesta);
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
      await recuperaInformacion("A");
    };
    pintaUsuarioFiltros();
  }, []);

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
        </Row>
      </Card>

      <TableUI
        /*tabla={tabla}*/
        tabla={informacion.tabla}
        onClicActions={onClickAccion}
        pantalla={pantallaComponente[1]}
        filtros={""}
        setFiltros={[]}
        switches={[]}
        pantallaFiltros={pantallaComponente[1]}
      />

      {/*MODAL PARA CARGA Y DESCARGA DE ARCHIVOS FUERA DE EL CRUD GENERICO*/}
      <Modal
        show={showHideAdjuntar}
        onHide={limpiezaFormAdjuntar}
        animation={true}
        size="lg"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{estadoIniCRUDmodal.tituloModal}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <RowRB style={{ alignItems: "center" }}>
              <hr />
              {estadoIniCRUDmodal.nombreArchivo && (
                <>
                  <aside>
                    <ul>
                      <li>{estadoIniCRUDmodal.nombreArchivo}</li>
                    </ul>
                  </aside>
                  <VisualizePDF pdfBlob={pdfBlob} />
                </>
              )}
            </RowRB>

            <ModalFooter>
              <ButtonRB
                style={{ width: "auto" }}
                variant="secondary"
                onClick={limpiezaFormAdjuntar}
              >
                Cerrar
              </ButtonRB>
            </ModalFooter>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};
