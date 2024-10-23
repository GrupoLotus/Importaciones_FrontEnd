import React, { useState } from "react";
import { FormInputs } from "./FormInput";
import { Modal, Button, Row, Col, Form } from "react-bootstrap";
import { ModalFooter } from "react-bootstrap";
import { useForm } from "../../hooks/useForm";

/*
limpiezaForm                = Limpiar el formulario al estado inicial
onSubmit                    = Accion al hacer evento submit
inputs                      = Json con inputs a pintar dinamicamente
setValoresForm              = Setear valores del formularios
valoresForm                 = Valores del formulario
opCRUDModal                 = Operaciones que indica que tipo de modal sera y nombre de boton y titulo modal, se recupera ID de registro
*/
//props.inputs = [{}] //Arreglo vacio solo para que muestre el modal y probar funcionalidad
export const ModalMaestro = ({ ...props }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [
    valores,
    setValoresForm,
    restablecerForm,
    setearUpdateForm,
    cambioValores,
  ] = useForm();

  const handleInputChange = (event) => {
    props.setValoresForm(event);
    setValoresForm(event);
  };

  const limpiezaForm = () => {
    props.limpiezaForm();
    restablecerForm();
  };

  const guardarCambios = () => {
    props.setEstadoIniCRUDmodal({
      ...props.opCRUDModal,
      tipoSubmit: "modificar",
    });
    restablecerForm();
  };

  if (typeof props.inputs === "undefined") {
    return;
  }

  let inputs = [{}];
  switch (props.opCRUDModal.tipoCRUD) {
    case 1: //Pinta inputs para Crear
      inputs = props.inputs.create;
      break;
    case 2: //Pinta inputs para modificar
      inputs = props.inputs.update;
      break;
    case 3: //Pinta inputs para eliminar
      inputs = props.inputs.delete;
      break;
    case 4: //Pinta inputs para resetear contraseña USUARIOS
      inputs = props.inputs.reset;
      break;
    case 5: // SOLICITUD MOSTRAR TODO MODO LECTURA
      inputs = props.inputs.read;
      inputs.forEach((elemento) => {
        if (elemento) {
          // Itera a través de todos los elementos y establece disabled en true
          elemento.disabled = true;
        }
      });
      break;
    default:
      break;
  }

  return (
    <>
      <Modal
        show={props.showHide}
        onHide={limpiezaForm}
        animation={true}
        size={props.opCRUDModal.tamanoModal || "lg"}
        fullscreen={fullscreen}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <Modal.Header>
          <Row className="align-items-center w-100">
            <Col xs={11} className="d-flex justify-content-center">
              <Modal.Title>{props.opCRUDModal.tituloModal}</Modal.Title>
            </Col>
            <Col xs={1} className="d-flex justify-content-center">
              <Button variant="text" onClick={() => setFullscreen(!fullscreen)}>
                {fullscreen ? (
                  <i
                    className="bi bi-fullscreen-exit"
                    style={{ color: "white" }}
                  ></i>
                ) : (
                  <i
                    className="bi bi-fullscreen"
                    style={{ color: "white" }}
                  ></i>
                )}
              </Button>
              <Button variant="text" onClick={limpiezaForm}>
                <i className="bi bi-x-lg" style={{ color: "white" }}></i>
              </Button>
            </Col>
          </Row>
        </Modal.Header>

        <Modal.Body>
          <Form onSubmit={props.onSubmit}>
            <Row style={{ alignItems: "center" }}>
              {inputs.map((item, index) => (
                <FormInputs
                  input={item}
                  setValoresForm={handleInputChange}
                  valoresForm={props.valoresForm}
                  valoresSelect={props.valoresSelect}
                  referencia1={props.opCRUDModal.usuario}
                  key={item.name || index}
                  //Valores opcionales para la tabla esta se pinta no se registra en tblMaestrosJson
                  data={props.data}
                  tableData={props.tableData}
                  setTableData={props.setTableData}
                  handleInputChangeTabla={props.handleInputChangeTabla}
                  showAcciones={props.showAcciones}
                />
              ))}
            </Row>
            <ModalFooter>
              <Button
                style={{ width: "auto" }}
                variant="secondary"
                onClick={limpiezaForm}
              >
                Cerrar
              </Button>
              {props.opCRUDModal.tituloBoton3 &&
                props.opCRUDModal.tituloBoton3 != "N/A" && (
                  <Button
                    disabled={cambioValores}
                    style={{ width: "auto" }}
                    variant="danger"
                    type="submit"
                    onClick={() =>
                      props.setEstadoIniCRUDmodal({
                        ...props.opCRUDModal,
                        tipoSubmit: "despachoTotal",
                      })
                    }
                  >
                    {props.opCRUDModal.tituloBoton3}
                  </Button>
                )}
              {props.opCRUDModal.tituloBoton != "N/A" && (
                <Button
                  style={{ width: "auto" }}
                  variant="primary"
                  type="submit"
                  onClick={guardarCambios}
                >
                  {props.opCRUDModal.tituloBoton}
                </Button>
              )}
              {props.opCRUDModal.tituloBoton2 && (
                <Button
                  disabled={cambioValores}
                  style={{ width: "auto" }}
                  variant="success"
                  type="submit"
                  onClick={() =>
                    props.setEstadoIniCRUDmodal({
                      ...props.opCRUDModal,
                      tipoSubmit: "cambiarEtapa",
                    })
                  }
                >
                  {props.opCRUDModal.tituloBoton2}
                </Button>
              )}
            </ModalFooter>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};
