import { Link } from "react-router-dom";
import LogoNavBar from "../img/LogoNavBar.svg";
import { Layout, Avatar, Space, Badge, Dropdown, message, Grid } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuthContext } from "../../connection/authContext";

const { Header } = Layout;
const { useBreakpoint } = Grid;
export const NavBar = (...props) => {
  const { loginOut, datosUsuario } = useAuthContext();
  const { CambioClave, setCambioClave } = props[0];
  const { md } = useBreakpoint();

  const onClick = ({ key }) => {
    if (key == 1) {
      setCambioClave(!CambioClave);
    } else if (key == 2) {
      loginOut();
    } else {
      message.error(`Opcion seleccionada invalida`);
    }
  };

  const items = [
    {
      label: <span style={{ fontSize: "17px" }}>Cambiar contraseña</span>,
      key: 1,
      icon: "bi bi-safe-fill" && (
        <i className="bi bi-safe-fill" style={{ fontSize: "20px" }}></i>
      ),
    },
    {
      label: <span style={{ fontSize: "17px" }}>Cerrar sesión</span>,
      key: 2,
      icon: <LogoutOutlined style={{ fontSize: "20px" }} />,
    },
  ];

  return (
    <>
      <Header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between", // Distribuir los elementos
        }}
      >
        <Space direction="horizontal">
          {/*<Badge count={1}>*/}
          <Link className="navbar-brand text-white" to="/menu">
            <img className="img-NavBar" src={LogoNavBar} width="100" />
          </Link>
        </Space>

        <Space direction="horizontal">
          {md && (
            <label style={{ color: "white", fontSize: "17px" }}>
              {datosUsuario.nombre}
            </label>
          )}
          <Dropdown menu={{ items, onClick }}>
            <a onClick={(e) => e.preventDefault()}>
              <Badge dot>
                <Avatar size={50} icon={<UserOutlined />} />
              </Badge>
            </a>
          </Dropdown>
        </Space>
      </Header>
    </>
  );
};
