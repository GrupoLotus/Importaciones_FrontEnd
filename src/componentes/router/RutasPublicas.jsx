import { Navigate, Outlet } from "react-router-dom";
import { HOME } from "./paths";
import { useAuthContext } from "../../connection/authContext";
import { ToastContainer } from "react-toastify";

export const RutasPublicas = () => {
  const { isLogged } = useAuthContext();

  if (isLogged) {
    return <Navigate to={HOME} />;
  }

  return (
    <div>
      <Outlet />
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
    </div>
  );
};
