import { useEffect, useState } from "react";
import { useGlobalContext } from "../../../connection/globalContext";
import { useForm } from "../../../hooks/useForm";
import ClienteHttp from "../../../connection/ClienteHttp";
import {
  endPoint,
  defError,
  infoMensajes,
  datosReload,
} from "../../../types/definiciones";
import { toast } from "react-toastify";
import { Layout, Space, Button, Grid } from "antd";
import { PlusSquareFilled } from "@ant-design/icons";
import TableUI from "../../ui/TableUI";
import { ModalMaestro } from "../../ui/ModalMaestro";
import { caseDefaultClick, caseDefaultSubmit } from "../../ui/GeneralMessage";
import { CargaDescargaXLS } from "../../ui/CargaDescargaXLS";
import {
  Button as ButtonRB,
  Form,
  Modal,
  ModalFooter,
  Row,
} from "react-bootstrap";

const pantallaComponente = ["DESPACHO", "DESPACHOS", "Despacho"];

// Función para enviar eventos a Google Analytics
const sendAnalyticsEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};
const campoAnalytics = "despacho";

export const Despacho = () => {
  const { Header } = Layout;
  const { useBreakpoint } = Grid;
  const { md } = useBreakpoint();

  const { isLoading } = useGlobalContext();
  const [showModalCRUD, setShowModalCRUD] = useState(false);
  const estadoInicialForm = {
    bl: "",
  };
  const estadoInicialModal = {
    tituloModal: "",
    tipoCRUD: 1,
    tituloBoton: `Crear ${pantallaComponente[2]}`,
    fila: {},
  };
  const [valoresForm, setValoresForm, restablecerForm, setearUpdateForm] =
    useForm(estadoInicialForm);
  const [informacion, setInformacion] = useState([{}]);
  const [estadoIniCRUDmodal, setEstadoIniCRUDmodal] =
    useState(estadoInicialModal);
  const switchesTabla = [
    {
      Eliminados: false,
      Activos: true,
      Finalizados: false,
    },
  ];
  const filtrosTablaDefault = {
    Eliminados: false,
    Activos: true,
    Finalizados: false,
  };

  const [filtrosTabla, setFiltrosTabla] = useForm(filtrosTablaDefault);
  const [filtroSeleccionados, setFiltroSeleccionados] = useState("");
  const [selectBox, setSelectBox] = useState([{}]);

  //INFORMACION EN TABLAS
  ///Json inicial para pintar la tabla con registros por defecto
  const data = [
    {
      ["Item Code"]: {
        value: "",
        elemento: "select",
        type: "select",
        placeholder: "Item Code",
        tamanio: 20,
        obligatorio: true,
        disabled: false,
        especial: "select",
        width: "160px",
      },
      ["Family Code"]: {
        value: "",
        elemento: "input",
        type: "text",
        placeholder: "Family Code",
        tamanio: 25,
        obligatorio: true,
        disabled: true,
      },
      Descripcion: {
        value: "",
        elemento: "input",
        type: "text",
        placeholder: "Descripcion",
        tamanio: 150,
        obligatorio: true,
        disabled: true,
      },
      CTNS: {
        value: "",
        elemento: "input",
        type: "number",
        placeholder: "",
        tamanio: 5,
        obligatorio: true,
        disabled: false,
      },
      ["QTY PZA X CAJA"]: {
        value: "",
        elemento: "input",
        type: "number",
        placeholder: "",
        tamanio: 5,
        obligatorio: true,
        disabled: true,
      },
      ["TOTAL QTY"]: {
        value: "",
        elemento: "input",
        type: "number",
        placeholder: "",
        tamanio: 5,
        obligatorio: true,
        disabled: true,
      },
      Sucursal: {
        value: "",
        elemento: "select",
        type: "select",
        placeholder: "Sucursal",
        tamanio: 20,
        obligatorio: true,
        disabled: false,
        especial: "select",
        width: "200px",
      },
    },
  ];
  const [tableData, setTableData] = useState(data);
  const [showAcciones, setShowAcciones] = useState(false);

  //CARGA DE ARCHIVO EXCEL
  const [showHideAdjuntarExcel, setShowHideAdjuntarExcel] = useState(false);
  const [fileError, setFileError] = useState(false);

  const limpiezaFormAdjuntarExcel = () => {
    //Limpieza y reseteo de valores del formulario del modal
    setShowHideAdjuntarExcel(!showHideAdjuntarExcel);
  };

  //Subir archivo excel a servidor
  const handleDropExcel = async (file) => {
    if (typeof file === "undefined") {
      return;
    }
    sendAnalyticsEvent(`${campoAnalytics}_carga_excel_intento`);
    isLoading(true);
    const formData = new FormData();
    formData.append("id", estadoIniCRUDmodal.id);
    formData.append("file", file);
    await ClienteHttp.postfile(
      endPoint.baseURL +
        endPoint.modArchivo +
        endPoint.upDownExcel +
        endPoint.upFileDetImp +
        endPoint.fileXLS +
        estadoIniCRUDmodal.id,
      formData
    )
      .then(async ({ data }) => {
        toast.success(data.mensaje);
        setShowHideAdjuntarExcel(!showHideAdjuntarExcel);
        await recuperaInformacion(filtroSeleccionados);
        sendAnalyticsEvent(`${campoAnalytics}_carga_excel_exitoso`);
      })
      .catch((err) => {
        console.log(err);
        //No se encuentra logueado
        if (err.response.statusText === datosReload.statusText) {
          toast.error(err.response.data.msg);
          setTimeout(() => {
            window.location.reload(true);
            window.location.href = datosReload.urlHome;
          }, datosReload.setTime);
        }

        if (err.message === defError.errorServer) {
          toast.error(infoMensajes.errorDeComunicacion);
        } else {
          toast.error(err.response.data.mensaje);
        }
        sendAnalyticsEvent(`${campoAnalytics}_carga_excel_fallido`, {
          error:
            err.response.data.errors ||
            err.response.data.mensaje ||
            "Error desconocido",
        });
      })
      .finally(() => isLoading(false));
  };

  const descargaPlantillaExcel = async () => {
    isLoading(true);
    sendAnalyticsEvent(`${campoAnalytics}_descarga_excel_intento`);
    const nombreArchivo = "Plantilla_DetalleImportacion";
    await ClienteHttp.getFile(
      endPoint.baseURL +
        endPoint.modArchivo +
        endPoint.upDownExcel +
        endPoint.recuperaFile +
        endPoint.fileXLS +
        nombreArchivo
    )
      .then((response) => {
        const contentType = response.headers["content-type"];
        const blob = new Blob([response.data], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        sendAnalyticsEvent(`${campoAnalytics}_descarga_excel_exitoso`);
      })
      .catch((err) => {
        console.log(err);
        //No se encuentra logueado
        if (err.response.statusText === datosReload.statusText) {
          toast.error(err.response.data.msg);
          setTimeout(() => {
            window.location.reload(true);
            window.location.href = datosReload.urlHome;
          }, datosReload.setTime);
        }

        if (err.message === defError.errorServer) {
          toast.error(infoMensajes.errorDeComunicacion);
        } else {
          toast.error(err.response.data.mensaje);
        }
        sendAnalyticsEvent(`${campoAnalytics}_descarga_excel_fallido`, {
          error:
            err.response.data.errors ||
            err.response.data.mensaje ||
            "Error desconocido",
        });
      })
      .finally(() => isLoading(false));
  };

  const descargaExcel = async (id, nombre) => {
    isLoading(true);
    const nombreArchivo = `Detalle_Importacion_${nombre}.xlsx`;
    await ClienteHttp.getFile(
      endPoint.baseURL +
        endPoint.modArchivo +
        endPoint.upDownExcel +
        endPoint.downFileDetImp +
        endPoint.fileXLS +
        id
    )
      .then((response) => {
        const contentType = response.headers["content-type"];
        const blob = new Blob([response.data], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        a.click();
      })
      .catch((err) => {
        console.log(err);
        //No se encuentra logueado
        if (err.response.statusText === datosReload.statusText) {
          toast.error(err.response.data.msg);
          setTimeout(() => {
            window.location.reload(true);
            window.location.href = datosReload.urlHome;
          }, datosReload.setTime);
        }

        if (err.message === defError.errorServer) {
          toast.error(infoMensajes.errorDeComunicacion);
        } else {
          toast.error(err.response.data.mensaje);
        }
      })
      .finally(() => isLoading(false));
  };

  const limpiezaForm = () => {
    //Limpieza y reseteo de valores del formulario del modal
    setShowModalCRUD(!showModalCRUD);
    restablecerForm();
  };

  // Función para validar y formatear los datos de la tabla
  const validateAndFormatTableData = (tableData) => {
    if (tableData.length === 0) {
      return { success: false, error: "Debe registrar al menos un registro" };
    }

    const totalesPorItem = {};

    /*const valoresVistos = {};
    let duplicateIndex = false;

    for (let i = 0; i < tableData.length; i++) {
      const objeto = tableData[i];
      const valorPrincipal = objeto["Item Code"].value;
      const valorSecundario = objeto.Sucursal.value;

      if (valoresVistos[`${valorPrincipal}-${valorSecundario}`]) {
        duplicateIndex = i + 1;
        mensaje = `Registro de la fila ${duplicateIndex} con bodega duplicada`
        break;
      }

      valoresVistos[`${valorPrincipal}-${valorSecundario}`] = true;
    }

    if (duplicateIndex !== false) {
      return {
        success: false,
        error: mensaje,
      };
    }*/

    const formatearRegistros = (registros) => {
      return registros.map((row) => {
        const registroFormateado = {};
        let itemCode = "";

        Object.keys(row).forEach((field) => {
          const fieldConfig = row[field];
          let value = fieldConfig.value;

          if (field === "Item Code") {
            itemCode = value;
            if (!totalesPorItem[itemCode]) {
              totalesPorItem[itemCode] = { CTNS: 0, "QTY PZA X CAJA": 0 };
            }
          } else if (fieldConfig.type === "number") {
            value = value === "" ? null : Number(value);
            if (field === "CTNS" || field === "QTY PZA X CAJA") {
              totalesPorItem[itemCode][field] += value || 0;
            }
          }

          registroFormateado[field] = value;
        });

        return registroFormateado;
      });
    };

    const registrosFormateados = formatearRegistros(tableData);
    /*const discrepancias = [];

    for (const [i, itemCode] of Object.keys(totalesPorItem).entries()) {
      const itemSel = selectBox["Item Code"].find(
        (item) => item.value === itemCode
      );

      if (itemSel) {
        const valorCTN = itemSel.ctns - totalesPorItem[itemCode].CTNS;
        const valorQTZ =
          itemSel.qtyPzaXCaja - totalesPorItem[itemCode]["QTY PZA X CAJA"];
        if (
          (valorCTN == 0 && valorQTZ > 0) ||
          (valorCTN > 0 && valorQTZ == 0)
        ) {
          valCero = true;
          mensaje = `El item ${itemCode} tiene un saldo en ${
            valorCTN == 0 ? "QTY PZA X CAJA" : "CTNS"
          } de ${valorCTN > 0 ? valorCTN : valorQTZ} que no puede quedar`;
          break;
        }
      }
    }

    if (valCero) {
      return {
        success: false,
        error: mensaje,
      };
    }*/

    return { success: true, data: registrosFormateados };
  };

  //Evento Submit
  const onSubmit = async (e) => {
    let tipoCRUD = estadoIniCRUDmodal.tipoCRUD;
    if (estadoIniCRUDmodal.tipoSubmit === "cambiarEtapa") {
      //El evento de submit es para cambiar de etapa de setea a 4
      tipoCRUD = 4;
    } else if (estadoIniCRUDmodal.tipoSubmit == "despachoTotal") {
      tipoCRUD = 5;
    }
    e.preventDefault();
    isLoading(true);
    switch (tipoCRUD) {
      case 1: //Crear Registro
        sendAnalyticsEvent(`${campoAnalytics}_crea_intento`, {
          method: "form_submit",
        });
        /*const resultCreate = validateAndFormatTableData(tableData);

        if (!resultCreate.success) {
          sendAnalyticsEvent(`${campoAnalytics}_fallaValidaciones_crea`); 
          toast.error(resultCreate.error);
          isLoading(false);
          return;
        }*/

        const json = {
          ...valoresForm,
          //valoresTabla: resultCreate.data,
        };

        await ClienteHttp.post(
          endPoint.baseURL + endPoint.modDespacho + endPoint.despacho,
          json
        )
          .then(async ({ data }) => {
            toast.success(data.mensaje);
            limpiezaForm();
            await recuperaInformacion(filtroSeleccionados);
            sendAnalyticsEvent(`${campoAnalytics}_crea_exitoso`);
          })
          .catch((err) => {
            //No se encuentra logueado
            if (err.response.statusText === datosReload.statusText) {
              toast.error(err.response.data.msg);
              setTimeout(() => {
                window.location.reload(true);
                window.location.href = datosReload.urlHome;
              }, datosReload.setTime);
            }

            if (err.message === defError.errorServer) {
              toast.error(infoMensajes.errorDeComunicacion);
            }
            if (err.response.data.errors) {
              toast.error(err.response.data.errors[0].msg);
            } else {
              toast.error(err.response.data.mensaje);
            }
            sendAnalyticsEvent(`${campoAnalytics}_crea_fallido`, {
              error:
                err.response.data.errors ||
                err.response.data.mensaje ||
                "Error desconocido",
            });
          })
          .finally(() => isLoading(false));
        break;
      case 2: //Modificar Registro
        sendAnalyticsEvent(`${campoAnalytics}_modifica_intento`, {
          method: "form_submit",
        });
        const resultUpdate = validateAndFormatTableData(tableData);

        if (!resultUpdate.success) {
          toast.error(resultUpdate.error);
          isLoading(false);
          sendAnalyticsEvent(`${campoAnalytics}_fallaValidaciones_modifica`);
          return;
        }

        const jsonUpdate = {
          ...valoresForm,
          valoresTabla: resultUpdate.data,
        };

        await ClienteHttp.put(
          endPoint.baseURL + endPoint.modDespacho + endPoint.despacho,
          jsonUpdate
        )
          .then(async ({ data }) => {
            toast.success(data.mensaje);
            limpiezaForm();
            await recuperaInformacion(filtroSeleccionados);
            sendAnalyticsEvent(`${campoAnalytics}_modifica_exitoso`);
          })
          .catch((err) => {
            //No se encuentra logueado
            if (err.response.statusText === datosReload.statusText) {
              toast.error(err.response.data.msg);
              setTimeout(() => {
                window.location.reload(true);
                window.location.href = datosReload.urlHome;
              }, datosReload.setTime);
            }

            if (err.message === defError.errorServer) {
              toast.error(infoMensajes.errorDeComunicacion);
            }
            if (err.response.data.errors) {
              toast.error(err.response.data.errors[0].msg);
            } else {
              toast.error(err.response.data.mensaje);
            }
            sendAnalyticsEvent(`${campoAnalytics}_modifica_fallido`, {
              error:
                err.response.data.errors ||
                err.response.data.mensaje ||
                "Error desconocido",
            });
          })
          .finally(() => isLoading(false));
        break;
      case 3: //Eliminar Registro
        sendAnalyticsEvent(`${campoAnalytics}_elimina_intento`, {
          method: "form_submit",
        });
        await ClienteHttp.delete(
          endPoint.baseURL +
            endPoint.modDespacho +
            endPoint.despacho +
            "/" +
            estadoIniCRUDmodal.fila.ID
        )
          .then(async ({ data }) => {
            toast.success(data.mensaje);
            limpiezaForm();
            await recuperaInformacion(filtroSeleccionados);
            sendAnalyticsEvent(`${campoAnalytics}_elimina_exitoso`);
          })
          .catch((err) => {
            //No se encuentra logueado
            if (err.response.statusText === datosReload.statusText) {
              toast.error(err.response.data.msg);
              setTimeout(() => {
                window.location.reload(true);
                window.location.href = datosReload.urlHome;
              }, datosReload.setTime);
            }

            if (err.message === defError.errorServer) {
              toast.error(infoMensajes.errorDeComunicacion);
            }
            if (err.response.data.errors) {
              toast.error(err.response.data.errors[0].msg);
            } else {
              toast.error(err.response.data.mensaje);
            }
            sendAnalyticsEvent(`${campoAnalytics}_elimina_fallido`, {
              error:
                err.response.data.errors ||
                err.response.data.mensaje ||
                "Error desconocido",
            });
          })
          .finally(() => isLoading(false));
        break;
      case 4: //Cambiar de etapa
        sendAnalyticsEvent(`${campoAnalytics}_finaliza_intento`, {
          method: "form_submit",
        });
        await ClienteHttp.put(
          endPoint.baseURL +
            endPoint.modDespacho +
            endPoint.despacho +
            endPoint.cambioEtapa +
            "/" +
            estadoIniCRUDmodal.id
        )
          .then(async ({ data }) => {
            toast.success(data.mensaje);
            limpiezaForm();
            await recuperaInformacion(filtroSeleccionados);
            sendAnalyticsEvent(`${campoAnalytics}_finaliza_exitoso`);
          })
          .catch((err) => {
            //No se encuentra logueado
            if (err.response.statusText === datosReload.statusText) {
              toast.error(err.response.data.msg);
              setTimeout(() => {
                window.location.reload(true);
                window.location.href = datosReload.urlHome;
              }, datosReload.setTime);
            }

            if (err.message === defError.errorServer) {
              toast.error(infoMensajes.errorDeComunicacion);
            }
            if (err.response.data.errors) {
              toast.error(err.response.data.errors[0].msg);
            } else {
              toast.error(err.response.data.mensaje);
            }
            sendAnalyticsEvent(`${campoAnalytics}_finaliza_fallido`, {
              error:
                err.response.data.errors ||
                err.response.data.mensaje ||
                "Error desconocido",
            });
          })
          .finally(() => isLoading(false));
        break;
      case 5:
        isLoading(true);
        setEstadoIniCRUDmodal({
          ...estadoIniCRUDmodal,
          tituloBoton2: "",
        });
        let newTableData = [];
        newTableData = selectBox["Item Code"].map((item, index) => ({
          ["Item Code"]: {
            value: item.value,
            elemento: "select",
            type: "select",
            placeholder: "Item Code",
            tamanio: 20,
            obligatorio: true,
            disabled: false,
            especial: "select",
            width: "160px",
          },
          ["Family Code"]: {
            value: item.familyCode,
            elemento: "input",
            type: "text",
            placeholder: "Family Code",
            tamanio: 25,
            obligatorio: true,
            disabled: true,
          },
          Descripcion: {
            value: item.descripcionItem,
            elemento: "input",
            type: "text",
            placeholder: "Descripcion",
            tamanio: 150,
            obligatorio: true,
            disabled: true,
          },
          CTNS: {
            value: item.ctns,
            elemento: "input",
            type: "number",
            placeholder: "",
            tamanio: 5,
            obligatorio: true,
            disabled: false,
          },
          ["QTY PZA X CAJA"]: {
            value: item.qtyPzaXCaja,
            elemento: "input",
            type: "number",
            placeholder: "",
            tamanio: 5,
            obligatorio: true,
            disabled: true,
          },
          ["TOTAL QTY"]: {
            value: item.totalQty,
            elemento: "input",
            type: "number",
            placeholder: "",
            tamanio: 5,
            obligatorio: true,
            disabled: true,
          },
          Sucursal: {
            value: item.sucursal || "",
            label: item.sucursal || "",
            elemento: "select",
            type: "select",
            placeholder: "Sucursal",
            tamanio: 20,
            obligatorio: true,
            disabled: false,
            especial: "select",
            width: "200px",
          },
        }));

        setTableData(newTableData);
        isLoading(false);
        break;
      default:
        isLoading(false);
        toast.warning(caseDefaultSubmit);
        sendAnalyticsEvent(`${campoAnalytics}_accion_desconocida`, {
          method: "form_submit",
        });
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
        //setTableData(data);
        //setShowAcciones(true);
        sendAnalyticsEvent(`${campoAnalytics}_crea_modal`);
        setEstadoIniCRUDmodal({
          tipoCRUD: 1,
          tituloModal: `CREAR ${pantallaComponente[0]}`,
          tituloBoton: `Crear ${pantallaComponente[2]}`,
          fila,
          tamanoModal: "xl",
        });
        setShowModalCRUD(!showModalCRUD);
        isLoading(false);
        break;
      case 2: //Modificar || Leer Registro
        sendAnalyticsEvent(
          `${campoAnalytics}_${option === 2 ? "modifica" : "consulta"}__modal`
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
          tituloBoton3: option === 2 ? `${pantallaComponente[2]} Total` : "",
          fila,
          tamanoModal: "xl",
        });

        //Peticion para consulta el ID del rol y extraer la informacion
        const urlUpdate =
          endPoint.baseURL +
          endPoint.modDespacho +
          endPoint.despacho +
          `/${id}/${option}`;
        await ClienteHttp.get(urlUpdate)
          .then(({ data }) => {
            if (option === 2) {
              setShowAcciones(true);
            } else {
              setShowAcciones(false);
              for (let i = 0; i < data.respuesta.tabla.length; i++) {
                const objeto = data.respuesta.tabla[i];
                for (const propiedad in objeto) {
                  if (objeto.hasOwnProperty(propiedad)) {
                    objeto[propiedad].disabled = true;
                  }
                }
              }
            }
            setearUpdateForm(data.respuesta.info);
            setTableData(data.respuesta.tabla);
            const arraySelect = {
              ...selectBox,
              "Item Code": data.respuesta.items,
            };
            setSelectBox(arraySelect);
            setShowModalCRUD(!showModalCRUD);
            sendAnalyticsEvent(`${campoAnalytics}_muestra_registros_exitoso`);
          })
          .catch((err) => {
            //No se encuentra logueado
            if (err.response.statusText === datosReload.statusText) {
              toast.error(err.response.data.msg);
              setTimeout(() => {
                window.location.reload(true);
                window.location.href = datosReload.urlHome;
              }, datosReload.setTime);
            }

            if (err.message === defError.errorServer) {
              toast.error(infoMensajes.errorDeComunicacion);
            }
            if (err.response.data.errors) {
              toast.error(err.response.data.errors[0].msg);
            } else {
              toast.error(err.response.data.mensaje);
            }
            sendAnalyticsEvent(`${campoAnalytics}_muestra_registros_fallido`, {
              error:
                err.response.data.errors ||
                err.response.data.mensaje ||
                "Error desconocido",
            });
          })
          .finally(() => isLoading(false));
        break;
      case 3: //Eliminar Registro
        sendAnalyticsEvent(`${campoAnalytics}_elimina_modal`);
        setEstadoIniCRUDmodal({
          tipoCRUD: 3,
          tituloModal: `ELIMINAR ${pantallaComponente[0]}`,
          tituloBoton: `Eliminar ${pantallaComponente[2]}`,
          usuario: fila.NOMBREDELETE,
          fila,
          tamanoModal: "xl",
        });
        setShowModalCRUD(!showModalCRUD);
        isLoading(false);
        break;
      case 12: //Carga Archivo Excel
        setEstadoIniCRUDmodal({
          tituloModal: `CARGA ${pantallaComponente[1]}`,
          tituloBoton: "N/A",
          id,
        });
        setShowHideAdjuntarExcel(!showHideAdjuntarExcel);
        isLoading(false);
        break;
      case 13: //Descargar Archivo Excel
        await descargaExcel(id, fila.BL_IMPORTACION);
        isLoading(false);
        break;
      default:
        isLoading(false);
        toast.warning(caseDefaultClick);
        sendAnalyticsEvent(`${campoAnalytics}_click_incorrecto`);
        break;
    }
  };

  const handleInputChangeTabla = (e, rowIndex, field, isRemove = false) => {
    setEstadoIniCRUDmodal({
      ...estadoIniCRUDmodal,
      tituloBoton2: "",
    });
    const updatedData = [...tableData];
    const { value } = e.target ? e.target : e;
    const maxLength = data[0][field].tamanio;

    if (
      field === "Item Code" &&
      (data[0][field].elemento === "select" || isRemove)
    ) {
      const selectedItem = selectBox["Item Code"].find(
        (item) => item.value === value
      );
      if (selectedItem) {
        // Validación de sucursal
        const currentSucursal = updatedData[rowIndex]["Sucursal"].value;
        const itemExistsInSucursal = updatedData.some(
          (row, idx) =>
            idx !== rowIndex &&
            row["Item Code"].value === selectedItem.value &&
            row["Sucursal"].value === currentSucursal
        );

        if (itemExistsInSucursal && !isRemove) {
          toast.warning(
            `El item ${selectedItem.value} ya existe para la sucursal ${currentSucursal}.`
          );
          // Limpiar el select de sucursal
          updatedData[rowIndex] = {
            ...updatedData[rowIndex],
            [field]: {
              ...updatedData[rowIndex][field],
              value: "",
              selectedOption: null, // Si estás usando react-select
            },
          };
          return;
        }

        // Calcular la cantidad disponible para CTNS y QTY PZA X CAJA
        let usedQuantityCTN = 0;
        //let usedQuantityQTY = 0;

        updatedData.forEach((row, idx) => {
          if (
            row["Item Code"].value === selectedItem.value &&
            (!isRemove || idx !== rowIndex)
          ) {
            usedQuantityCTN += parseInt(row["CTNS"].value) || 0;
            //usedQuantityQTY += parseInt(row["QTY PZA X CAJA"].value) || 0;
          }
        });

        const availableQuantityCTN = selectedItem.ctns - usedQuantityCTN;
        //const availableQuantityQTY = selectedItem.qtyPzaXCaja - usedQuantityQTY;

        if (!isRemove) {
          if (availableQuantityCTN <= 0) {
            // || availableQuantityQTY <= 0) {
            toast.error(
              `El item ${selectedItem.value} no tiene ${
                availableQuantityCTN <= 0 ? "CTNS" : "QTY PZA X CAJA"
              } disponibles.`
            );
            return;
          }

          updatedData[rowIndex] = {
            ...updatedData[rowIndex],
            "Item Code": {
              ...updatedData[rowIndex]["Item Code"],
              value: selectedItem.value,
            },
            "Family Code": {
              ...updatedData[rowIndex]["Family Code"],
              value: selectedItem.familyCode,
            },
            Descripcion: {
              ...updatedData[rowIndex]["Descripcion"],
              value: selectedItem.descripcionItem,
            },
            CTNS: {
              ...updatedData[rowIndex]["CTNS"],
              value: availableQuantityCTN,
              originalValue: selectedItem.ctns,
            },
            "QTY PZA X CAJA": {
              ...updatedData[rowIndex]["QTY PZA X CAJA"],
              value: availableQuantityQTY,
              originalValue: selectedItem.qtyPzaXCaja,
            },
            "TOTAL QTY": {
              ...updatedData[rowIndex]["TOTAL QTY"],
              value: availableQuantityCTN * availableQuantityQTY,
            },
          };
        }
      }
    } else if (field === "Sucursal") {
      const newSucursal = value;
      const currentItemCode = updatedData[rowIndex]["Item Code"].value;

      const itemExistsInSucursal = updatedData.some(
        (row, idx) =>
          idx !== rowIndex &&
          row["Item Code"].value === currentItemCode &&
          row["Sucursal"].value === newSucursal
      );

      if (itemExistsInSucursal) {
        toast.warning(
          `El item ${currentItemCode} ya existe para la sucursal ${newSucursal}.`
        );
        // Limpiar el select de sucursal
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          [field]: {
            ...updatedData[rowIndex][field],
            value: "",
            selectedOption: null, // Si estás usando react-select
          },
        };
        return;
      }

      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        [field]: { ...updatedData[rowIndex][field], value: newSucursal },
      };
    } else if (field === "CTNS" || field === "QTY PZA X CAJA") {
      const newValue = parseInt(value);
      if (isNaN(newValue) || newValue <= 0) {
        toast.error(`Por favor, ingrese un número válido para ${field}.`);
        return;
      }

      const selectedItem = selectBox["Item Code"].find(
        (item) => item.value === updatedData[rowIndex]["Item Code"].value
      );

      //const currentItemCode = updatedData[rowIndex]["Item Code"].value;
      //const totalOriginal = updatedData[rowIndex][field].originalValue;
      const totalOriginal =
        field == "CTNS" ? selectedItem.ctns : selectedItem.qtyPzaXCaja;

      let sumOfField = newValue;
      updatedData.forEach((row, idx) => {
        if (row["Item Code"].value === selectedItem.value && idx !== rowIndex) {
          sumOfField += parseInt(row[field].value) || 0;
        }
      });

      if (sumOfField > totalOriginal) {
        let mensaje = `No es posible agregar el valor ${newValue} al item ${selectedItem.value}, el valor de ${field} importado es de ${totalOriginal} y la suma de los valores sería de ${sumOfField}`;
        toast.error(mensaje);
        return;
      }

      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        [field]: { ...updatedData[rowIndex][field], value: newValue },
      };

      // Actualizar TOTAL QTY
      const valCTNS =
        field === "CTNS" ? newValue : updatedData[rowIndex]["CTNS"].value;
      const valQTYXCAJA =
        field === "QTY PZA X CAJA"
          ? newValue
          : updatedData[rowIndex]["QTY PZA X CAJA"].value;
      updatedData[rowIndex]["TOTAL QTY"] = {
        ...updatedData[rowIndex]["TOTAL QTY"],
        value: valCTNS * valQTYXCAJA,
      };
    } else if (data[0][field].especial === "numero") {
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        [field]: {
          ...updatedData[rowIndex][field],
          value: value.replace(/[^0-9.-]/g, ""),
        },
      };
    } else {
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        [field]: {
          ...updatedData[rowIndex][field],
          value: value.substring(0, maxLength),
        },
      };
    }

    setTableData(updatedData);
  };
  //Peticion para pintar READ tabla o inpunt
  const recuperaInformacion = async (filtro) => {
    isLoading(true);
    sendAnalyticsEvent(`${campoAnalytics}_info`, { filtro: filtro });
    await ClienteHttp.get(
      endPoint.baseURL +
        endPoint.modDespacho +
        endPoint.despacho +
        endPoint.epConsulta +
        filtro
    )
      .then(({ data }) => {
        setInformacion(data.respuesta);

        //ESPACIO PARA ARREGLOS
        let newObjeto = "";
        let arraySelect = {};

        newObjeto = data.respuesta.valSelect.Importaciones.map((obj) => {
          return {
            value: obj.id,
            descripcion: obj.descripcion,
          };
        });

        arraySelect = {
          ...arraySelect,
          bl: newObjeto,
          "Item Code": [],
          Sucursal: data.respuesta.valSelect.Sucursales,
        };

        setSelectBox(arraySelect);
        sendAnalyticsEvent(`${campoAnalytics}_info_exitoso`, {
          filtro: filtro,
          cantidad: data.respuesta.length,
        });
      })
      .catch((err) => {
        console.log(err);
        //No se encuentra logueado
        if (err.response.statusText === datosReload.statusText) {
          toast.error(err.response.data.msg);
          setTimeout(() => {
            window.location.reload(true);
            window.location.href = datosReload.urlHome;
          }, datosReload.setTime);
        }

        if (err.message === defError.errorServer) {
          toast.error(infoMensajes.errorDeComunicacion);
        } else {
          toast.error(err.response.data.mensaje);
        }
        sendAnalyticsEvent(`${campoAnalytics}_info_fallido`, {
          error:
            err.response.data.errors ||
            err.response.data.mensaje ||
            "Error desconocido",
        });
      })
      .finally(() => isLoading(false));
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
      sendAnalyticsEvent(`${campoAnalytics}_cambio_filtro`, {
        nuevoFiltro: valores,
      });
    };
    pintaUsuarioFiltros();
  }, [filtrosTabla]);

  return (
    <>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // Distribuir los elementos
          height: 50,
          backgroundColor: "#011d38",
          color: "white",
        }}
      >
        <Space align="center" />
        <label></label>
        <Space align="center">
          <h3>{pantallaComponente[1]}</h3>
        </Space>
        <Space align="center">
          <Button
            type="default"
            onClick={() => onClickAccion(1)}
            icon={<PlusSquareFilled />}
          >
            {md ? `Crear ${pantallaComponente[2]}` : ""}
          </Button>
        </Space>
      </Header>

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
          //Valores para pintar tabla dinamica
          data={data}
          tableData={tableData}
          setTableData={setTableData}
          handleInputChangeTabla={handleInputChangeTabla}
          showAcciones={showAcciones}
        />
      )}

      {/*MODAL PARA CARGA Y DESCARGA DE ARCHIVOS FUERA DE EL CRUD GENERICO - CARGA DE ARCHIVOS EXCEL CONTEO*/}
      <Modal
        show={showHideAdjuntarExcel}
        onHide={limpiezaFormAdjuntarExcel}
        animation={true}
        size="lg"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{estadoIniCRUDmodal.tituloModal}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row style={{ alignItems: "center" }}>
              <CargaDescargaXLS
                onFileUpload={handleDropExcel}
                setFileError={setFileError}
              />
            </Row>
            <ModalFooter>
              <div>
                <ButtonRB
                  style={{ width: "auto" }}
                  variant="warning"
                  onClick={() => descargaPlantillaExcel()}
                >
                  <i className="bi bi-file-earmark-spreadsheet">
                    &nbsp; Descargar Plantilla Excel
                  </i>
                </ButtonRB>
              </div>
              <div>
                <ButtonRB
                  style={{ width: "auto" }}
                  variant="secondary"
                  onClick={limpiezaFormAdjuntarExcel}
                >
                  Cerrar
                </ButtonRB>
              </div>
            </ModalFooter>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};
