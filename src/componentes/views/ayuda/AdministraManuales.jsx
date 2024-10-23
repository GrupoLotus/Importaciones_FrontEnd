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
import {
  Button as ButtonRB,
  Form,
  Modal,
  ModalFooter,
  Row as RowRB,
} from "react-bootstrap";
import { CargaDescargaFile } from "../../ui/CargaDescargaFile";
import { VisualizePDF } from "../../ui/VisualizePDF";
import { IconButton, Tooltip } from "@mui/material";

const { useBreakpoint } = Grid;
const pantallaComponente = [
  "DOCUMENTO DE APOYO",
  "DOCUMENTOS DE APOYO",
  "Documento",
];

const api_endpoint =
  endPoint.baseURL + endPoint.modAyuda + endPoint.administraManual;
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
const campoAnalytics = "DocumentoApoyo";
const campoPrincipal = "nombre";

export const AdministraManuales = () => {
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
  const filtrosTablaDefault = {
    Eliminados: false,
    Activos: true,
  };
  const [filtrosTabla, setFiltrosTabla] = useForm(filtrosTablaDefault);
  const switchesTabla = [
    {
      Eliminados: false,
      Activos: true,
    },
  ];
  const [filtroSeleccionados, setFiltroSeleccionados] = useState("");

  const [showHideAdjuntar, setShowHideAdjuntar] = useState(false);
  const [fileError, setFileError] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);

  const limpiezaFormAdjuntar = () => {
    setShowHideAdjuntar(false);
    restablecerForm();
  };

  //Subir archivo a servidor
  const handleDrop = async (file) => {
    if (typeof file === "undefined") {
      return;
    }
    isLoading(true);
    const formData = new FormData();
    formData.append("id", estadoIniCRUDmodal.id);
    formData.append("path", "Manuales"); //correlativo solicitud
    formData.append("file", file);

    try {
      const { data } = await ClienteHttp.postfile(api_endpointFile, formData);
      toast.success(data.mensaje);
      setEstadoIniCRUDmodal({
        ...estadoIniCRUDmodal,
        nombreArchivo: file.path,
      });
      await descargaPDF(estadoIniCRUDmodal.id);
      await recuperaInformacion("A");
      sendAnalyticsEvent(`${campoAnalytics} Carga Archivo Exitoso`, {
        dato: estadoIniCRUDmodal.id,
      });
    } catch (error) {
      errorRequest(error);
      sendAnalyticsEvent(`${campoAnalytics} Carga Archivo Fallido`, {
        error:
          error.response.data.errors ||
          error.response.data.mensaje ||
          "Error desconocido",
      });
    } finally {
      isLoading(false);
    }
  };

  const eliminarArchivo = async () => {
    try {
      const { data } = await ClienteHttp.delete(
        api_endpointFile + `/${estadoIniCRUDmodal.id}`
      );
      toast.success(data.mensaje);
      setEstadoIniCRUDmodal({
        ...estadoIniCRUDmodal,
        nombreArchivo: "",
      });
      await recuperaInformacion("A");
      sendAnalyticsEvent(`${campoAnalytics} Eliminar Archivo Exitoso`, {
        dato: estadoIniCRUDmodal.id,
      });
    } catch (error) {
      errorRequest(error);
      sendAnalyticsEvent(`${campoAnalytics} Eliminar Archivo Fallido`, {
        error:
          error.response.data.errors ||
          error.response.data.mensaje ||
          "Error desconocido",
      });
    } finally {
      isLoading(false);
    }
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
          const { data } = await ClienteHttp.post(api_endpoint, json);
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
          const { data } = await ClienteHttp.put(api_endpoint, jsonUpdate);
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
            api_endpoint + `/${estadoIniCRUDmodal.fila.ID}`
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
        });

        //Peticion para consulta el ID del rol y extraer la informacion
        try {
          const { data } = await ClienteHttp.get(api_endpoint + `/${id}`);
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
          usuario: fila.NOMBRE,
          fila,
        });
        setShowModalCRUD(!showModalCRUD);
        isLoading(false);
        break;
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
      let valores = "";
      filtrosTabla.Activos && (valores = valores + "A");
      filtrosTabla.Eliminados && (valores = valores + "N");
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
        /*tabla={tabla}*/
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
          valoresSelect={setSelectBox}
          opCRUDModal={estadoIniCRUDmodal}
          setEstadoIniCRUDmodal={setEstadoIniCRUDmodal}
        />
      )}

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
              {!estadoIniCRUDmodal.nombreArchivo ? (
                <CargaDescargaFile
                  onFileUpload={handleDrop}
                  setFileError={setFileError}
                />
              ) : (
                <>
                  <aside>
                    <h5>Archivo cargado exitosamente</h5>
                    <ul>
                      <li>
                        {estadoIniCRUDmodal.nombreArchivo}
                        <Tooltip arrow placement="right" title="Eliminar">
                          <IconButton
                            className="ms-4"
                            color="error"
                            onClick={eliminarArchivo}
                          >
                            <i className="bi bi-trash"></i>
                          </IconButton>
                        </Tooltip>
                      </li>
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
              {estadoIniCRUDmodal.tituloBoton !== "N/A" && (
                <ButtonRB
                  style={{ width: "auto" }}
                  variant="primary"
                  onClick={limpiezaFormAdjuntar}
                >
                  {estadoIniCRUDmodal.tituloBoton}
                </ButtonRB>
              )}
            </ModalFooter>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};
