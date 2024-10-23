import { useEffect, useState } from "react";
import { useGlobalContext } from "../../../connection/globalContext";
import { useForm } from "../../../hooks/useForm";
import ClienteHttp, { errorRequest } from "../../../connection/ClienteHttp";
import { endPoint } from "../../../types/definiciones";
import { toast } from "react-toastify";
import { Layout, Grid, Card, Row, Col, Statistic, Typography } from "antd";
import {
  ClockCircleOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
} from "@ant-design/icons";
import GraficasGeneral from "../../ui/GraficasGeneral";

const pantallaComponente = [
  "IMPORTACION",
  "GRÁFICAS DE INVENTARIO",
  "Importación",
];

const { Header, Content } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

// Función para enviar eventos a Google Analytics
const sendAnalyticsEvent = (eventName, eventParams = {}) => {
  if (window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
};
const campoAnalytics = "Grafica Inventario";

export const GraficaInventario = () => {
  const { md } = useBreakpoint();
  const { isLoading } = useGlobalContext();
  const [informacion, setInformacion] = useState([{}]);
  const [filtrosTabla, setFiltrosTabla] = useForm("A");
  const [graphData, setGraphData] = useState({
    despachoAnio: [],
    productosDespachados: [],
    fechaDespachada: [],
    sucursalDespachado: [],
    productoXDespacho: [],
  });

  //Peticion para pintar READ tabla o inpunt
  const recuperaInformacion = async (filtro) => {
    isLoading(true);
    try {
      const { data } = await ClienteHttp.get(
        endPoint.baseURL +
          endPoint.modInventario +
          endPoint.graficaInventario +
          endPoint.epConsulta +
          filtro
      );
      setInformacion(data.respuesta);
      // Procesar datos para gráficos
      const despachoAnio =
        data.respuesta.despachosPorAno ||
        {}.map(([Año, Cantidad]) => ({ Año, Cantidad }));

      const productosDespachados =
        data.respuesta.productosMasDespachados ||
        {}.map(([Producto, Cantidad]) => ({ Producto, Cantidad }));

      const fechaDespachada =
        data.respuesta.fechasMasDespachadas ||
        {}.map(([Fecha, Cantidad]) => ({ Fecha, Cantidad }));

      const sucursalDespachado =
        data.respuesta.sucursalesConMasDespachos ||
        {}.map(([Sucursal, Cantidad]) => ({ Sucursal, Cantidad }));

      const productoXDespacho =
        data.respuesta.cantidadDespachosPorSucursal ||
        {}.map(([Sucursal, Cantidad]) => ({ Sucursal, Cantidad }));

      setGraphData({
        despachoAnio,
        productosDespachados,
        fechaDespachada,
        sucursalDespachado,
        productoXDespacho,
      });
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
      await recuperaInformacion(filtrosTabla);
    };
    pintaUsuarioFiltros();
  }, [filtrosTabla]);

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center", // Distribuir los elementos
          height: 50,
          backgroundColor: "#011d38",
          color: "white",
        }}
      >
        {" "}
        <h3>{pantallaComponente[1]}</h3>
      </Header>
      <Content>
        {graphData.despachoAnio.length > 0 ? (
          <Row gutter={[8, 8]} align="top">
            <Col xs={24}>
              <Card>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <GraficasGeneral
                      title="Despachos por Año"
                      titleColor="black"
                      data={graphData.despachoAnio}
                      type="pie"
                      xDataKey="Año"
                      yDataKey="Cantidad"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <GraficasGeneral
                      title="Fecha con mas despachos"
                      titleColor="black"
                      data={graphData.fechaDespachada}
                      type="pie"
                      xDataKey="Fecha"
                      yDataKey="Cantidad"
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24}>
              <Card>
                <GraficasGeneral
                  title="Productos mas despachados"
                  titleColor="black"
                  data={graphData.productosDespachados}
                  type="bar"
                  xDataKey="Producto"
                  yDataKey="Cantidad"
                  xAxisProps={{
                    angle: 0,
                    textAnchor: "end",
                  }}
                  barProps={{ fill: "orange", stroke: "black" }}
                />
              </Card>
            </Col>
            <Col xs={24}>
              <Card
                title={
                  <Title level={3} style={{ textAlign: "center", margin: 0 }}>
                    Datos Sucursales
                  </Title>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <GraficasGeneral
                      title="Despachos Realizados"
                      titleColor="black"
                      data={graphData.sucursalDespachado}
                      type="pie"
                      xDataKey="Sucursal"
                      yDataKey="Cantidad"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <GraficasGeneral
                      title="Productos Enviados"
                      titleColor="black"
                      data={graphData.productoXDespacho}
                      type="pie"
                      xDataKey="Sucursal"
                      yDataKey="Cantidad"
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Title
              level={4}
              style={{
                color: "white",
                marginBottom: "10px",
              }}
            >
              No se han cargado detalles
            </Title>
          </div>
        )}
      </Content>
    </Layout>
  );
};
