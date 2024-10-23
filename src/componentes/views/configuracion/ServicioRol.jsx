import { useState, useEffect } from "react";
import { useGlobalContext } from "../../../connection/globalContext";
import { useForm } from "../../../hooks/useForm";
import ClienteHttp, { errorRequest } from "../../../connection/ClienteHttp";
import {
  endPoint,
  defError,
  infoMensajes,
  datosReload,
} from "../../../types/definiciones";
import { Search } from "@mui/icons-material";
import { InputAdornment, TextField } from "@mui/material";
import { Layout, Grid, Card, Row, Col, Collapse, Transfer, Button } from "antd";
import { toast } from "react-toastify";

const { Content } = Layout;
const { useBreakpoint } = Grid;
const pantallaComponente = ["ROLES Y SERVICIOS", "ROLES Y SERVICIOS"];

export const ServicioRol = () => {
  const { md } = useBreakpoint();
  const { isLoading } = useGlobalContext();
  const estadoBusqueda = {
    busqueda: "",
  };
  const [valoresBusqueda, setValoresBusqueda] = useForm(estadoBusqueda);
  const [infoRoles, setInfoRoles] = useState([]);
  const [originalState, setOriginalState] = useState([]);
  const [changes, setChanges] = useState({});
  const [loading, setLoading] = useState(false);

  //Cuando cambia un registro
  const handleChange = (nextTargetKeys, direction, moveKeys, roleKey) => {
    setInfoRoles((prevInfoRoles) => {
      return prevInfoRoles.map((role) => {
        if (role.key === roleKey) {
          const updatedActivos = role.data.filter((item) =>
            nextTargetKeys.includes(item.key)
          );
          return { ...role, activos: updatedActivos };
        }
        return role;
      });
    });

    const newChanges = { ...changes };
    moveKeys.forEach((key) => {
      if (direction === "right") {
        if (newChanges[key] === false) {
          delete newChanges[key];
        } else {
          newChanges[key] = true;
        }
      } else {
        if (newChanges[key] === true) {
          delete newChanges[key];
        } else {
          newChanges[key] = false;
        }
      }
    });

    setChanges(newChanges);
  };

  //Cuando se cambia el acordeón
  const handleCollapseChange = (key) => {
    setInfoRoles(originalState);
    setChanges({});
  };

  //Peticion para pintar las listas deplegables Accordion
  const fnRecuperaServicios = async () => {
    isLoading(true);
    setLoading(true);
    try {
      const url =
        endPoint.baseURL +
        endPoint.modulo +
        endPoint.servicioRol +
        valoresBusqueda.busqueda;

      const data = await ClienteHttp.get(url);
      setInfoRoles(data.data.respuesta.procesos);
      setOriginalState(data.data.respuesta.procesos);
    } catch (error) {
      errorRequest(error);
    } finally {
      isLoading(false);
      setLoading(false);
    }
  };

  //Accion del boton Guardar en pantalla
  const fnAccionBoton = async (rol) => {
    isLoading(true);
    try {
      const json = {
        rol: rol,
        servicios: changes,
      };

      const response = await ClienteHttp.post(
        endPoint.baseURL + endPoint.modulo + endPoint.servicioRol,
        json
      );
      setChanges({});
      await fnRecuperaServicios();
      toast.success(response.data.mensaje);
    } catch (error) {
      errorRequest(error);
    } finally {
      isLoading(false);
    }
  };

  //Hook para que se renderizen una vez los componentes en el montaje y desmontaje
  useEffect(() => {
    if (valoresBusqueda.busqueda === "") isLoading(true);
    const peticionesIniciales = async () => {
      await fnRecuperaServicios();
      if (valoresBusqueda.busqueda === "") isLoading(false);
    };
    peticionesIniciales();
  }, [valoresBusqueda]);

  return (
    <Content style={{ padding: 10 }}>
      <Card style={{ width: "100%", backgroundColor: "#011d38", border: 0 }}>
        <Row align="middle" justify="space-between">
          <Col
            xs={24}
            offset={md ? 8 : 0}
            md={8}
            style={{ textAlign: "center" }}
          >
            <h3>{pantallaComponente[1]}</h3>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <TextField
              id="buscarPI"
              placeholder="Buscar Rol"
              className="mb-3"
              name="busqueda"
              style={{ backgroundColor: "white" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search style={{ color: "black" }} />
                  </InputAdornment>
                ),
              }}
              variant="standard"
              onChange={setValoresBusqueda}
            />
          </Col>
        </Row>
      </Card>
      <Row justify="center" style={{ paddingTop: 15 }}>
        <Col span={24}>
          {infoRoles && infoRoles.length > 0 ? (
            <Collapse
              accordion
              items={infoRoles.map((element, index) => ({
                key: element.key,
                label: element.label,
                children: (
                  <>
                    <Row justify="center" style={{ paddingTop: 15 }}>
                      <Col style={{ display: "flex" }}>
                        <Transfer
                          dataSource={element.data?.map((data) => ({
                            key: data.key,
                            title: data.title,
                          }))}
                          titles={["Disponibles", "Actuales"]}
                          targetKeys={element.activos?.map((act) => act.key)}
                          onChange={(nextTargetKeys, direction, moveKeys) =>
                            handleChange(
                              nextTargetKeys,
                              direction,
                              moveKeys,
                              element.key
                            )
                          }
                          render={(item) => item.title}
                          oneWay
                          showSearch
                          listStyle={{
                            width: md ? 350 : "100%",
                            height: 300,
                            marginBottom: md ? 0 : 15,
                            marginTop: md ? 0 : 15,
                          }}
                          style={{
                            display: md ? "flex" : "block",
                            justifyContent: "center",
                          }}
                        />
                      </Col>
                    </Row>
                    <Row justify="center" style={{ marginTop: 15 }}>
                      <Button
                        type="primary"
                        onClick={() => fnAccionBoton(element.key)}
                        disabled={Object.keys(changes).length === 0}
                        style={{ width: 200 }}
                      >
                        Guardar
                      </Button>
                    </Row>
                  </>
                ),
              }))}
              onChange={handleCollapseChange}
              style={{ background: "white", width: "auto" }}
            />
          ) : (
            <Card style={{ background: "#011d38", width: "100%", border: 0 }}>
              <Row align="middle" justify="space-between">
                <Col xs={24} style={{ textAlign: "center" }}>
                  <h4>{loading ? "Cargando..." : "No existen roles"}</h4>
                </Col>
              </Row>
            </Card>
          )}
        </Col>
      </Row>
    </Content>
  );
};
