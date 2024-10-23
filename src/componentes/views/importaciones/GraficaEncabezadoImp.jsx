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
  "GRÁFICAS DE IMPORTACIONES",
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
const campoAnalytics = "Grafica Importaciones Enc";

export const GraficaEncabezadoImp = () => {
  const { md } = useBreakpoint();
  const { isLoading } = useGlobalContext();
  const [informacion, setInformacion] = useState([{}]);
  const [filtrosTabla, setFiltrosTabla] = useForm("A");
  const [graphData, setGraphData] = useState({
    yearlyData: [],
    originPortData: [],
    destPortData: [],
    durationStats: { promedio: 0, minimo: 0, maximo: 0 },
  });

  //Peticion para pintar READ tabla o inpunt
  const recuperaInformacion = async (filtro) => {
    isLoading(true);
    try {
      const { data } = await ClienteHttp.get(
        endPoint.baseURL +
          endPoint.modImport +
          endPoint.graficaEncImp +
          endPoint.epConsulta +
          filtro
      );
      setInformacion(data.respuesta);
      // Procesar datos para gráficos
      const yearlyData = Object.entries(data.respuesta.anioSalida || {}).map(
        ([Anio, Cantidad]) => ({ Anio, Cantidad })
      );
      const originPortData = Object.entries(
        data.respuesta.puertoOrigen || {}
      ).map(([Puerto, Cantidad]) => ({ Puerto, Cantidad }));
      const destPortData = Object.entries(
        data.respuesta.puertoDestino || {}
      ).map(([Puerto, Cantidad]) => ({ Puerto, Cantidad }));

      setGraphData({
        yearlyData,
        originPortData,
        destPortData,
        durationStats: data.respuesta.dias || {
          promedio: 0,
          minimo: 0,
          maximo: 0,
        },
      });
      sendAnalyticsEvent(`${campoAnalytics} Info Exitoso`, {
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

      <Content style={{ padding: "24px", backgroundColor: "#011d38" }}>
        {graphData.yearlyData.length > 0 ? (
          <Row gutter={[8, 8]} align="top">
            <Col xs={24} md={6}>
              <Card title={<Title level={4}>Duración del Viaje</Title>}>
                <Row gutter={[8, 8]}>
                  <Col xs={24}>
                    <Statistic
                      title="Promedio de días"
                      value={graphData.durationStats.promedio}
                      precision={1}
                      valueStyle={{ color: "#3f8600" }}
                      prefix={<ClockCircleOutlined />}
                      suffix="días"
                    />
                    <Statistic
                      title="Mínimo de días"
                      value={graphData.durationStats.minimo}
                      valueStyle={{ color: "#cf1322" }}
                      prefix={<ArrowDownOutlined />}
                      suffix="días"
                    />
                    <Statistic
                      title="Máximo de días"
                      value={graphData.durationStats.maximo}
                      valueStyle={{ color: "#1890ff" }}
                      prefix={<ArrowUpOutlined />}
                      suffix="días"
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
            <Col xs={24} md={18}>
              <Card>
                <GraficasGeneral
                  title="Importaciones por Año"
                  titleColor="black"
                  data={graphData.yearlyData}
                  type="bar"
                  xDataKey="Anio"
                  yDataKey="Cantidad"
                  xAxisProps={{
                    angle: 0,
                    textAnchor: "end",
                  }}
                  barProps={{ fill: "green", stroke: "black" }}
                />
              </Card>
            </Col>

            <Col xs={24}>
              <Card
                title={
                  <Title level={3} style={{ textAlign: "center", margin: 0 }}>
                    Importaciones por puertos
                  </Title>
                }
              >
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <GraficasGeneral
                      title="Origen"
                      titleColor="black"
                      data={graphData.originPortData}
                      type="pie"
                      xDataKey="Puerto"
                      yDataKey="Cantidad"
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <GraficasGeneral
                      title="Destino"
                      titleColor="black"
                      data={graphData.destPortData}
                      type="pie"
                      xDataKey="Puerto"
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
              No se han cargado importaciones
            </Title>
          </div>
        )}
      </Content>
    </Layout>
  );
};
