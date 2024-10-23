import Select from "react-select";

export const FormInputs = ({
  input,
  setValoresForm,
  valoresForm,
  valoresSelect,
  referencia1,
  ...props
}) => {
  if (typeof input === "undefined" || typeof valoresSelect === "undefined") {
    return;
  }

  //Todos los select a pintar ya deben venir armados y hacer match con el name de los valoresForm
  /*
   LOS DATOS QUE RECIBE SON:
   Elemento: si es Input o select
   Type: Text, Number, Date, Etc
   classNameLabel: Clase del titulo
   id_input: id
   name: name
   titulo: Titulo del label
   obligatorio: true o false
   className: clase del registro solicitado
   tamanio: tamaño del texto
   placeholder: texto a mostrar
   disabled: si esta activo o no
   styleObject: estilos

   return (
      <>
        <Form.Item label={input.titulo}>
          <Input
            placeholder={input.placeholder}
            name={input.name}
            className={input.className}
          />
        </Form.Item>
      </>
    );
    */

  let styleObject = new Function("return {" + input.style + "}")(); //Nueva función para style

  if (input.elemento === "input") {
    return (
      <>
        <div className={`${input.classNameLabel} `}>
          <label htmlFor={input.id_input} className="col-form-label">
            {input.titulo}
            {input.obligatorio && <label style={{ color: "red" }}>*</label>}
          </label>
        </div>
        <div className={input.className}>
          <input
            className="form-control"
            type={input.type}
            name={input.name}
            id={input.id_input}
            onChange={setValoresForm}
            value={valoresForm[input.name]}
            maxLength={input.tamanio}
            required={input.obligatorio}
            placeholder={input.placeholder}
            disabled={input.disabled}
            style={styleObject}
          />
        </div>
      </>
    );
  } else if (input.elemento === "label") {
    return (
      <div className={input.className}>
        <label className={input.classNameLabel}>
          <b>
            {input.titulo}
            {referencia1 ? (
              <>
                <b style={{ color: "#68BB59" }}> {referencia1}</b> ?
              </>
            ) : (
              ""
            )}
          </b>
        </label>
      </div>
    );
  } else if (input.elemento === "select") {
    return (
      <>
        <div className={input.classNameLabel}>
          <label>{input.titulo}</label>
          {input.obligatorio && <label style={{ color: "red" }}>*</label>}
        </div>
        <div className={input.className} style={{ margin: "5px 0" }}>
          <Select
            isDisabled={input.disabled}
            onChange={(selected) =>
              setValoresForm({
                target: {
                  name: input.name,
                  value: selected.value,
                  type: "selectSearch",
                },
              })
            }
            name={input.name}
            id={input.id_input}
            options={valoresSelect[input.name].map((option) => ({
              value: option.value,
              label: option.descripcion,
            }))}
            isSearchable={true}
            placeholder="Seleccione"
            required={input.obligatorio}
            value={
              valoresSelect[input.name].find(
                (option) => option.value == valoresForm[input.name]
              ) && {
                value: valoresSelect[input.name].find(
                  (option) => option.value == valoresForm[input.name]
                ).value,
                label: valoresSelect[input.name].find(
                  (option) => option.value == valoresForm[input.name]
                ).descripcion,
              }
            }
          />
        </div>
      </>
    );
  } else if (input.elemento === "table") {
    const handleRemoveRow = (rowIndex) => {
      const updatedData = [...props.tableData];
      const removedRow = updatedData[rowIndex];
      updatedData.splice(rowIndex, 1); // Eliminar la fila
      props.handleInputChangeTabla(
        {
          target: {
            value: removedRow["Item Code"].value,
          },
        },
        rowIndex,
        "Item Code",
        true
      );

      props.setTableData(updatedData);
    };

    const handleAddRow = () => {
      const newRow = Object.keys(props.data[0]).reduce((obj, field) => {
        obj[field] = {
          value: "",
          elemento: props.data[0][field].elemento,
          type: props.data[0][field].type,
          placeholder: props.data[0][field].placeholder || "",
          tamanio: props.data[0][field].tamanio,
          obligatorio: props.data[0][field].obligatorio,
          disabled: props.data[0][field].disabled,
          menuPosition: props.data[0][field].menuPosition,
          width: props.data[0][field].width,
        };
        return obj;
      }, {});
      props.setTableData([...props.tableData, newRow]);
    };
    return (
      <div className={input.className}>
        <table className={input.classNameLabel} id="table">
          <thead>
            <tr
              style={{
                backgroundColor: "#0D6EFD",
                color: "white",
                textAlign: "center",
              }}
            >
              {Object.keys(props.data[0]).map((field, index) => (
                <th key={index} style={{ verticalAlign: "middle" }}>
                  {field}
                </th>
              ))}
              {props.showAcciones && <th key={999}></th>}
            </tr>
          </thead>
          <tbody>
            {props.tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.keys(row).map((field, index) => (
                  <td key={index}>
                    {row[field].elemento === "select" ? (
                      <div style={{ margin: "5px 0" }}>
                        <Select
                          styles={{
                            control: (baseStyles, state) => ({
                              ...baseStyles,
                              width: row[field].width || "auto",
                            }),
                            menu: (baseStyles) => ({
                              ...baseStyles,
                              width: row[field].width || "auto",
                            }),
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                          }}
                          menuPosition={"fixed"}
                          menuPortalTarget={document.body} // Renderiza el menú en el body del documento
                          menuPlacement="auto" // Ajusta automáticamente la posición del menú
                          isDisabled={row[field].disabled}
                          isSearchable={true}
                          size={row[field].maxLength}
                          placeholder="Seleccione"
                          required={row[field].obligatorio}
                          onChange={(e) =>
                            props.handleInputChangeTabla(e, rowIndex, field)
                          }
                          options={valoresSelect[field].map((option) => ({
                            value: option.value,
                            label: option.descripcion,
                          }))}
                          value={
                            row[field].selectedOption ||
                            (row[field].value &&
                            valoresSelect[field].find(
                              (option) => option.value === row[field].value
                            )
                              ? {
                                  value: row[field].value,
                                  label: valoresSelect[field].find(
                                    (option) =>
                                      option.value === row[field].value
                                  ).descripcion,
                                }
                              : null)
                          }
                          //value={row[field].selectedOption || null}
                        />
                      </div>
                    ) : row[field].elemento === "moneda" &&
                      row[field].type === "text" ? (
                      <NumericFormat
                        className="form-control"
                        type={row[field].type || "text"}
                        onChange={(e) =>
                          props.handleInputChangeTabla(e, rowIndex, field)
                        }
                        value={row[field].value}
                        maxLength={row[field].maxLength}
                        required={row[field].obligatorio}
                        placeholder={row[field].placeholder}
                        disabled={row[field].disabled}
                        thousandSeparator={true}
                        decimalSeparator={"."}
                        prefix={"Q "}
                        decimalScale={2}
                        removeFormatting={true}
                      />
                    ) : row[field].elemento === "porcentaje" &&
                      row[field].type === "text" ? (
                      <NumericFormat
                        className="form-control"
                        type={row[field].type || "text"}
                        onChange={(e) =>
                          props.handleInputChangeTabla(e, rowIndex, field)
                        }
                        value={
                          (row[field].value * 100).toLocaleString("en-US") + "%"
                        } // Formatear como porcentaje
                        maxLength={row[field].maxLength}
                        required={row[field].obligatorio}
                        placeholder={row[field].placeholder}
                        disabled={row[field].disabled}
                        suffix={"%"}
                        decimalScale={0}
                        removeFormatting={true}
                      />
                    ) : (
                      // Aquí colocas el código JSX para generar el input
                      <input
                        type={row[field].type || "text"}
                        className="form-control"
                        style={{ border: "none" }}
                        value={row[field].value}
                        maxLength={row[field].maxLength}
                        size={row[field].maxLength}
                        placeholder={row[field].placeholder}
                        disabled={row[field].disabled}
                        required={row[field].obligatorio}
                        onChange={(e) =>
                          props.handleInputChangeTabla(e, rowIndex, field)
                        }
                      />
                    )}
                  </td>
                ))}
                {props.showAcciones && (
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="btn btn-danger"
                      type="button"
                      onClick={() => handleRemoveRow(rowIndex)}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              {props.showAcciones && (
                <td
                  colSpan={Object.keys(props.data[0]).length}
                  style={{ textAlign: "center" }}
                >
                  <input
                    className="btn btn-warning"
                    type="button"
                    value="Agregar fila"
                    onClick={handleAddRow}
                  />
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </div>
    );
  } else if (input.elemento === "textarea") {
    return (
      <>
        <div className={input.classNameLabel}>
          <label htmlFor={input.id_input} className="col-form-label">
            {input.titulo}
          </label>
          {input.obligatorio && <label style={{ color: "red" }}>*</label>}
        </div>
        <div className={input.className}>
          <textarea
            name={input.name}
            id={input.id_input}
            className="form-control"
            onChange={setValoresForm}
            value={valoresForm[input.name]}
            maxLength={input.tamanio}
            required={input.obligatorio}
            placeholder={input.placeholder}
            disabled={input.disabled}
          ></textarea>
        </div>
      </>
    );
  } else {
    null;
  }
};
