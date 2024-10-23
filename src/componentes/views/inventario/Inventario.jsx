import { useEffect, useState } from "react";
import { useGlobalContext } from "../../../connection/globalContext";
import ClienteHttp, { errorRequest } from "../../../connection/ClienteHttp";
import { endPoint } from "../../../types/definiciones";
import { toast } from "react-toastify";
import { Card, Row, Col, Modal, Table } from "antd";
import TableUI from "../../ui/TableUI";
import { caseDefaultClick } from "../../ui/GeneralMessage";

const pantallaComponente = ["INVENTARIO", "INVENTARIO", "Inventario"];

// Función para enviar eventos a Google Analytics
const sendAnalyticsEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};
const campoAnalytics = "Inventario";
const campoPrincipal = "bl";

export const Inventario = () => {
  const { isLoading } = useGlobalContext();
  const [informacion, setInformacion] = useState([{}]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [infoItem, setInfoItem] = useState([]);
  const [columsImportacion, setColumsImportacion] = useState([
    {
      title: "Importaciones",
      dataIndex: "bl",
      key: "bl",
    },
  ]);

  const [columsSucursal, setColumsSucursal] = useState([
    {
      title: "Sucursales",
      dataIndex: "sucursal",
      key: "sucursal",
    },
  ]);

  //Manejador de botones en tabla para manejo de estados
  const onClickAccion = async (option, id = 0, fila = "") => {
    if (id === 0 && (option === 2 || option === 3)) {
      return 0;
    }
    isLoading(true);
    switch (option) {
      case 5: //Modificar || Leer Registro
        isLoading(true);
        setInfoItem({
          item: id,
          BLs: fila.BLs || [],
          SUCURSALES: fila.SUCURSALES || [],
        });

        setIsModalVisible(!isModalVisible);
        sendAnalyticsEvent(`${campoAnalytics} "Consulta"`);
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
    await ClienteHttp.get(
      endPoint.baseURL +
        endPoint.modInventario +
        endPoint.inventario +
        endPoint.epConsulta +
        filtro
    )
      .then(({ data }) => {
        setInformacion(data.respuesta);
        sendAnalyticsEvent(`${campoAnalytics} Tabla Exitoso`, {
          filtro: filtro,
          cantidad: data.respuesta.length,
        });
      })
      .catch((error) => {
        errorRequest(error);
        sendAnalyticsEvent(`${campoAnalytics} Tabla Fallido`, {
          error:
            error.response.data.errors ||
            error.response.data.mensaje ||
            "Error desconocido",
        });
      })
      .finally(() => isLoading(false));
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
          <Col xs={24} style={{ textAlign: "center" }}>
            <h3>{pantallaComponente[1]}</h3>
          </Col>
        </Row>
      </Card>

      <TableUI
        tabla={informacion.tabla}
        onClicActions={onClickAccion}
        pantalla={pantallaComponente[1]}
        filtros={[]}
        setFiltros={[]}
        switches={[]}
        pantallaFiltros={pantallaComponente[1]}
      />

      <Modal
        title={`Detalle Item - ${infoItem.item}`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(!isModalVisible)}
        width="95%"
        style={{ maxWidth: 1200 }}
        footer={null}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={24} md={12}>
            <Card title="Historial de Importaciones" style={{ height: "100%" }}>
              <Table
                dataSource={infoItem.BLs?.map((bl, index) => ({
                  key: index,
                  bl,
                }))}
                columns={columsImportacion}
                pagination={false}
              />
            </Card>
          </Col>
          <Col xs={24} sm={24} md={12}>
            <Card title="Historial de Despachos" style={{ height: "100%" }}>
              <Table
                dataSource={infoItem.SUCURSALES?.map((sucursal, index) => ({
                  key: index,
                  sucursal,
                }))}
                columns={columsSucursal}
                pagination={false}
              />
            </Card>
          </Col>
        </Row>
      </Modal>
    </>
  );
};
