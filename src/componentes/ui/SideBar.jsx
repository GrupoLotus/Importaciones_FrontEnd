import React, { useState } from "react";
import { useAuthContext } from "../../connection/authContext";
import { Layout, Menu, Grid } from "antd";
import { useNavigate } from "react-router-dom";

const { useBreakpoint } = Grid;
const { Sider } = Layout;

const getItem = (
  label,
  key,
  icon = "bi bi-question-lg",
  children = null,
  type = null
) => {
  return {
    key,
    icon: icon && <i className={`${icon}`}></i>, // Aquí se renderiza el icono como un elemento <i>
    children,
    label,
    type,
  };
};

const processRoute = (route, rutas, parentKey = null) => {
  const { element, subMenu, path, texto, icono } = route;

  let key;
  if (parentKey === null) {
    key = `Menu${rutas.indexOf(route) + 1}`; // Es un elemento padre
  } else {
    key = `${parentKey}SubMenu${subMenu.indexOf(route) + 1}`; // Es un elemento hijo
  }

  if (subMenu) {
    return getItem(
      element,
      key,
      icono,
      subMenu.flatMap((subRoute, index) =>
        processRoute(subRoute, `${key}SubMenu${index + 1}`)
      )
    );
  } else {
    return getItem(texto, path, icono);
  }
};

export const SideBar = () => {
  const { datosUsuario } = useAuthContext();
  const { md } = useBreakpoint();
  const items = datosUsuario.rutas.flatMap((route) =>
    processRoute(route, datosUsuario.rutas)
  );

  const navigate = useNavigate();
  const handleMenuClick = (e) => {
    navigate(e.key);
  };

  const [collapsed, setCollapsed] = useState(false);
  //const [tema, setTema] = useState("light");
  const [tema, setTema] = useState("dark");

  const rootMenuKeys = items
    .filter((item) => item.key.startsWith("Menu"))
    .map((item) => item.key);
  const [openKeys, setOpenKeys] = useState([]);
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    if (rootMenuKeys.includes(latestOpenKey)) {
      setOpenKeys([latestOpenKey]);
    } else {
      setOpenKeys(keys);
    }
  };

  return (
    <Sider
      breakpoint="lg"
      collapsible={!md ? false : true}
      width="250" //Defecto 200
      //collapsedWidth="0" //Ocultar toda la barra completamente, defecto 80
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <Menu
        mode={!md ? "vertical" : "inline"}
        items={items}
        onOpenChange={onOpenChange}
        onClick={handleMenuClick}
        openKeys={openKeys}
        theme={tema}
      />
    </Sider>
  );
};
