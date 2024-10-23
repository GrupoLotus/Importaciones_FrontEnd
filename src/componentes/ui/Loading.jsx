import React from "react";
import { Spin } from "antd";
import { useAuthContext } from "../../connection/authContext";

export const Loading = () => {
  const { loading } = useAuthContext();

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <Spin spinning={loading} size="large" />
    </div>
  );
};
