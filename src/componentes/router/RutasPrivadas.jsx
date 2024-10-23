import { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { LOGIN } from "./paths";
import { NavBar } from "../ui/NavBar";
import { SideBar } from "../ui/SideBar";
import { ModalesNavBar } from "../ui/ModalesNavBar";
import { Loading } from "../ui/Loading";
import { useGlobalContext } from "../../connection/globalContext";
import { useAuthContext } from "../../connection/authContext";
import { ToastContainer } from "react-toastify";
import { Layout } from "antd";
import "../../styles/Layout.css";

export const RutasPrivadas = () => {
  const { Content } = Layout;

  const { loading } = useGlobalContext();
  const { isLogged } = useAuthContext();
  const [CambioClave, setCambioClave] = useState(false);

  if (!isLogged) {
    return <Navigate to={LOGIN} />;
  }

  return (
    <>
      <Layout>
        <NavBar CambioClave={CambioClave} setCambioClave={setCambioClave} />
        <Layout
          style={{
            minHeight: "90vh",
          }}
        >
          <SideBar />
          <Content className="content-wrapper">
            {loading && <Loading />}
            <Outlet />
          </Content>
        </Layout>
        <ModalesNavBar
          CambioClave={CambioClave}
          setCambioClave={setCambioClave}
        />
      </Layout>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
};
