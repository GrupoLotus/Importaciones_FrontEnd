import { Col, Container, Row } from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";

export const AccordionDinamic = ({
  padresEhijos,
  valoresForm,
  setValoresForm,
  fnAccionBoton,
}) => {
  if (typeof padresEhijos === "undefined") {
    return;
  }

  return (
    <>
      <Accordion className="container">
        {padresEhijos.map((element, index) => {
          return (
            //Iteracion para los acordiones padre
            <Accordion.Item eventKey={index} key={index}>
              <Accordion.Header>{element.nombreProceso}</Accordion.Header>
              <Accordion.Body>
                <Container>
                  <Row className="justify-content-md-center">
                    <Col xs="12" lg="6" className="text-center">
                      <Row className="mb-3">
                        <b>Activos</b>
                      </Row>
                      <Col className="text-start">
                        <div className="list-group">
                          {/*Iteracion de opciones a mostrar Activos Primer MAP*/}
                          {element.activos.length === 0 ? (
                            <label className="list-group-item text-center">
                              No existen modulos para este proceso
                            </label>
                          ) : (
                            element.activos.map((element2, index2) => {
                              return (
                                <label className="list-group-item" key={index2}>
                                  <input
                                    className="form-check-input me-1"
                                    type="checkbox"
                                    checked={
                                      valoresForm[
                                        `${element2.id}|${element.id}`
                                      ]
                                    }
                                    name={`${element2.id}|${element.id}`} //Se concatena id indicador y id proceso para hacer una primary key
                                    id={`${element2.id}|${element.id}`}
                                    key={`${index}-${index2}`}
                                    onChange={setValoresForm}
                                  />
                                  {element2.nombreIndicador}
                                </label>
                              );
                            })
                          )}
                        </div>
                      </Col>
                    </Col>
                    <Col xs="12" lg="6" className="text-center">
                      <Row className="mb-3">
                        <b>Disponibles para agregar</b>
                      </Row>
                      <Col className="text-start">
                        <div className="list-group">
                          {element.disponibles.length === 0 ? (
                            <label className="list-group-item text-center">
                              No existen modulos disponibles
                            </label>
                          ) : (
                            element.disponibles.map(
                              (elementDisponible, index) => {
                                return (
                                  <label
                                    className="list-group-item"
                                    key={index}
                                  >
                                    <input
                                      className="form-check-input me-1"
                                      type="checkbox"
                                      checked={
                                        valoresForm[
                                          `${elementDisponible.id}|${element.id}`
                                        ]
                                          ? true
                                          : false
                                      }
                                      name={`${elementDisponible.id}|${element.id}`}
                                      id={`${elementDisponible.id}|${element.id}`}
                                      key={`${index}`}
                                      onChange={setValoresForm}
                                    />
                                    {elementDisponible.nombreIndicador}
                                  </label>
                                );
                              }
                            )
                          )}
                        </div>
                      </Col>
                    </Col>

                    <button
                      type="button"
                      className="btn btn-primary mb-3 mt-3"
                      style={{ maxWidth: "300px" }}
                      onClick={() => fnAccionBoton(element.id)} //ID del proceso PAdre
                    >
                      Guardar
                    </button>
                  </Row>
                </Container>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
    </>
  );
};
