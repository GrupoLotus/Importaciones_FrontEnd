import { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { useGlobalContext } from "../../connection/globalContext";
import ClienteHttp, { errorRequest } from "../../connection/ClienteHttp";
import { endPoint } from "../../types/definiciones";
import { toast } from "react-toastify";

export const ModalesNavBar = (...props) => {
  const [form] = Form.useForm();
  const { CambioClave, setCambioClave } = props[0];
  const { isLoading, idCliente } = useGlobalContext();
  const [valueLoading, setValueLoading] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    setCambioClave(false);
  };

  const onFinish = async (values) => {
    isLoading(true);
    setValueLoading(true);
    try {
      const response = await ClienteHttp.put(
        `${endPoint.baseURL}${endPoint.modulo}${endPoint.usuarios}${endPoint.cambiarContrasena}`,
        { ...values, Usuario: idCliente }
      );
      toast.success(response.data.mensaje);
      handleCancel();
    } catch (error) {
      errorRequest(error);
    } finally {
      isLoading(false);
      setValueLoading(false);
    }
  };

  return (
    <Modal
      title="Cambio de contraseña"
      open={CambioClave}
      onCancel={handleCancel}
      footer={null}
    >
      <Form
        form={form}
        name="cambioContrasena"
        onFinish={onFinish}
        layout="vertical"
        className="dark-theme-modal" // Añadimos esta clase
      >
        <Form.Item
          name="claveActual"
          label="Contraseña actual"
          rules={[
            {
              required: true,
              message: "Por favor ingrese su contraseña actual",
            },
          ]}
        >
          <Input.Password
            placeholder="Contraseña actual"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          name="claveNueva"
          label="Contraseña nueva"
          rules={[
            {
              required: true,
              message: "Por favor ingrese su nueva contraseña",
            },
            {
              min: 8,
              message: "La contraseña debe tener al menos 8 caracteres",
            },
          ]}
        >
          <Input.Password
            placeholder="Contraseña nueva"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item
          name="claveNuevaRepetida"
          label="Repita la contraseña nueva"
          dependencies={["claveNueva"]}
          rules={[
            { required: true, message: "Por favor repita su nueva contraseña" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("claveNueva") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("Las contraseñas no coinciden")
                );
              },
            }),
          ]}
        >
          <Input.Password
            placeholder="Repita la contraseña nueva"
            iconRender={(visible) =>
              visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
            }
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={valueLoading}>
            Cambiar contraseña
          </Button>
          <Button onClick={handleCancel} style={{ marginLeft: 8 }}>
            Cancelar
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};
