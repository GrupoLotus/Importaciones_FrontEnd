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
import { CargaDescargaXLS } from "../../ui/CargaDescargaXLS";
import { Button as ButtonRB, Form, Modal, ModalFooter } from "react-bootstrap";

const { useBreakpoint } = Grid;
const pantallaComponente = ["DESPACHO", "DESPACHOS", "Despacho"];

// Función para enviar eventos a Google Analytics
const sendAnalyticsEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};
const campoAnalytics = "Despacho";
const campoPrincipal = "bl";

export const Despacho = () => {
  const { md } = useBreakpoint();

  const { isLoading } = useGlobalContext();
  const estadoInicialForm = {
    bl: "",
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
    isLoading(true);
    const formData = new FormData();
    formData.append("id", estadoIniCRUDmodal.id);
    formData.append("file", file);
    await ClienteHttp.postfile(
      endPoint.baseURL +
        endPoint.modArchivo +
        endPoint.upDownExcel +
        endPoint.upFileDespacho +
        endPoint.fileXLS +
        estadoIniCRUDmodal.id,
      formData
    )
      .then(async ({ data }) => {
        toast.success(data.mensaje);
        setShowHideAdjuntarExcel(!showHideAdjuntarExcel);
        await recuperaInformacion(filtroSeleccionados);
        sendAnalyticsEvent(`${campoAnalytics} Carga Excel Exitoso`);
      })
      .catch((error) => {
        errorRequest(error);
        sendAnalyticsEvent(`${campoAnalytics} Carga Excel Fallido`, {
          error:
            error.response.data.errors ||
            error.response.data.mensaje ||
            "Error desconocido",
        });
      })
      .finally(() => isLoading(false));
  };

  const descargaPlantillaExcel = async () => {
    isLoading(true);
    const nombreArchivo = "Plantilla_DetalleImportacion.xlsx";

    await ClienteHttp.getFile(
      endPoint.baseURL +
        endPoint.modArchivo +
        endPoint.upDownExcel +
        endPoint.downPlantDespacho +
        endPoint.fileXLS +
        estadoIniCRUDmodal.id
    )
      .then((response) => {
        const contentType = response.headers["content-type"];
        const blob = new Blob([response.data], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo;
        a.click();
        sendAnalyticsEvent(`${campoAnalytics} Descarga Excel Exitoso`);
      })
      .catch((error) => {
        errorRequest(error);
        sendAnalyticsEvent(`${campoAnalytics} Descarga Excel Fallido`, {
          error:
            error.response.data.errors ||
            error.response.data.mensaje ||
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
        endPoint.downFileDespacho +
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
        sendAnalyticsEvent(`${campoAnalytics} Descarga Plantilla Exitoso`);
      })
      .catch((error) => {
        errorRequest(error);
        sendAnalyticsEvent(`${campoAnalytics} Descarga Plantilla Fallido`, {
          error:
            error.response.data.errors ||
            error.response.data.mensaje ||
            "Error desconocido",
        });
      })
      .finally(() => isLoading(false));
  };

  const limpiezaForm = () => {
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
        /*const resultCreate = validateAndFormatTableData(tableData);

        if (!resultCreate.success) {
          sendAnalyticsEvent(`${campoAnalytics} Validaciones Crea Fallido`, {error: resultCreate.error}); 
          toast.error(resultCreate.error);
          isLoading(false);
          return;
        }*/

        const json = {
          ...valoresForm,
          //valoresTabla: resultCreate.data,
        };

        try {
          const { data } = await ClienteHttp.post(
            endPoint.baseURL + endPoint.modDespacho + endPoint.despacho,
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
        const resultUpdate = validateAndFormatTableData(tableData);

        if (!resultUpdate.success) {
          toast.error(resultUpdate.error);
          isLoading(false);
          sendAnalyticsEvent(
            `${campoAnalytics} Validaciones Modifica Fallido`,
            { error: resultUpdate.error }
          );
          return;
        }

        const jsonUpdate = {
          ...valoresForm,
          valoresTabla: resultUpdate.data,
        };

        try {
          const { data } = await ClienteHttp.put(
            endPoint.baseURL + endPoint.modDespacho + endPoint.despacho,
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
              endPoint.modDespacho +
              endPoint.despacho +
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
        const resultCambioEtapa = validateAndFormatTableData(tableData);

        if (!resultCambioEtapa.success) {
          toast.error(resultCambioEtapa.error);
          isLoading(false);
          sendAnalyticsEvent(
            `${campoAnalytics} Validaciones Modifica Fallido`,
            { error: resultCambioEtapa.error }
          );
          return;
        }

        try {
          const { data } = await ClienteHttp.put(
            endPoint.baseURL +
              endPoint.modDespacho +
              endPoint.despacho +
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
        sendAnalyticsEvent(`${campoAnalytics} Carga Total Exitoso`, {
          dato: estadoIniCRUDmodal.id,
        });
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
        //setTableData(data);
        //setShowAcciones(true);
        sendAnalyticsEvent(`${campoAnalytics} Modal Crea`);
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
          tituloBoton3: option === 2 ? `${pantallaComponente[2]} Total` : "",
          fila,
          tamanoModal: "xl",
        });

        //Peticion para consulta el ID del rol y extraer la informacion
        try {
          const { data } = await ClienteHttp.get(
            endPoint.baseURL +
              endPoint.modDespacho +
              endPoint.despacho +
              `/${id}/${option}`
          );
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
        sendAnalyticsEvent(`${campoAnalytics} OnClick Incorrecto`);
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

        updatedData.forEach((row, idx) => {
          if (
            row["Item Code"].value === selectedItem.value &&
            (!isRemove || idx !== rowIndex)
          ) {
            usedQuantityCTN += parseInt(row["CTNS"].value) || 0;
          }
        });

        const availableQuantityCTN = selectedItem.ctns - usedQuantityCTN;

        if (!isRemove) {
          if (availableQuantityCTN <= 0) {
            toast.error(
              `El item ${selectedItem.value} no tiene CTNS disponibles.`
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
              value: selectedItem.qtyPzaXCaja,
            },
            "TOTAL QTY": {
              ...updatedData[rowIndex]["TOTAL QTY"],
              value: availableQuantityCTN * selectedItem.qtyPzaXCaja,
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
    } else if (field === "CTNS") {
      const newValue = parseInt(value);
      if (isNaN(newValue) || newValue <= 0) {
        toast.error(`Por favor, ingrese un número válido para ${field}.`);
        return;
      }

      const selectedItem = selectBox["Item Code"].find(
        (item) => item.value === updatedData[rowIndex]["Item Code"].value
      );

      const totalOriginal = selectedItem.ctns;
      let sumOfField = newValue;
      updatedData.forEach((row, idx) => {
        if (row["Item Code"].value === selectedItem.value && idx !== rowIndex) {
          sumOfField += parseInt(row[field].value) || 0;
        }
      });

      if (sumOfField > totalOriginal) {
        let mensaje = `No es posible agregar el valor ${newValue} al item ${selectedItem.value}, el valor de CTNS importado es de ${totalOriginal} y la suma de los valores sería de ${sumOfField}`;
        toast.error(mensaje);
        return;
      }

      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        [field]: { ...updatedData[rowIndex][field], value: newValue },
      };

      // Actualizar TOTAL QTY
      const valCTNS = newValue;
      const valQTYXCAJA = updatedData[rowIndex]["QTY PZA X CAJA"].value;

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
    try {
      const { data } = await ClienteHttp.get(
        endPoint.baseURL +
          endPoint.modDespacho +
          endPoint.despacho +
          endPoint.epConsulta +
          filtro
      );

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
