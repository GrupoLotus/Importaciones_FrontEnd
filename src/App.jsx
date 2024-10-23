import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAuthContext } from "./connection/authContext";
import { AnalyticsTracker } from "./analytics/AnalyticsTracker";
import { HOME } from "./componentes/router/paths";
import { Home } from "./componentes/views/home/Home";
import { Login } from "./componentes/views/login/Login";
import { RutasPublicas } from "./componentes/router/RutasPublicas";
import { RutasPrivadas } from "./componentes/router/RutasPrivadas";
import { Rol } from "./componentes/views/configuracion/Rol";
import { ServicioRol } from "./componentes/views/configuracion/ServicioRol";
import { Usuario } from "./componentes/views/configuracion/Usuario";
import { Importacion } from "./componentes/views/importaciones/Importacion";
import { Puertos } from "./componentes/views/importaciones/Puertos";
import { GraficaEncabezadoImp } from "./componentes/views/importaciones/GraficaEncabezadoImp";
import { DetalleImportacion } from "./componentes/views/importaciones/DetalleImportacion";
import { Sucursal } from "./componentes/views/despacho/Sucursal";
import { Despacho } from "./componentes/views/despacho/Despacho";
import { Inventario } from "./componentes/views/inventario/Inventario";
import { Stock } from "./componentes/views/inventario/Stock";
import { GraficaInventario } from "./componentes/views/inventario/GraficaInventario";
import { AdministraManuales } from "./componentes/views/ayuda/AdministraManuales";
import { Manuales } from "./componentes/views/ayuda/Manuales";

const componentesDisponibles = {
  Rol: <Rol />,
  ServicioRol: <ServicioRol />,
  Usuario: <Usuario />,
  Importacion: <Importacion />,
  Puertos: <Puertos />,
  GraficaImpEnc: <GraficaEncabezadoImp />,
  ImportacionDetalle: <DetalleImportacion />,
  Sucursal: <Sucursal />,
  Despacho: <Despacho />,
  Inventario: <Inventario />,
  Stock: <Stock />,
  GraficaInventario: <GraficaInventario />,
  AdministraManuales: <AdministraManuales />,
  Manuales: <Manuales />,
};

const renderRoutes = (rutas, path = "") => {
  return rutas.reduce((acc, ruta) => {
    const Componente = componentesDisponibles[ruta.componente];
    if (Componente) {
      acc.push(
        <Route
          path={`${ruta.path}`}
          key={`${ruta.path}`}
          element={Componente}
        />
      );
    }
    if (ruta.hasOwnProperty("subMenu")) {
      acc.push(...renderRoutes(ruta.subMenu, `${path}${ruta.path}/`));
    }
    return acc;
  }, []);
};

export const App = () => {
  const { datosUsuario } = useAuthContext();

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<RutasPublicas />}>
          <Route index element={<Login />} />
          <Route path="*" element={<Login />} />
        </Route>
        <Route path={HOME} element={<RutasPrivadas />}>
          <Route index element={<Home />} />
          {datosUsuario.rutas && renderRoutes(datosUsuario.rutas)}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
/*
<BrowserRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<RutasPublicas />}>
          <Route index element={<Login />} />
          <Route path="*" element={<Login />} />
        </Route>
        <Route path={HOME} element={<RutasPrivadas />}>
          <Route index element={<Home />} />
          {datosUsuario.rutas && renderRoutes(datosUsuario.rutas)}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
    
    <BrowserRouter>
      <AnalyticsTracker />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        {datosUsuario.rutas && renderRoutes(datosUsuario.rutas)}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
    
    */
