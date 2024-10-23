import { useState } from "react";

export const useForm = (initialState = {}) => {
  const [valores, setValores] = useState(initialState);
  const [cambioValores, setCambioValores] = useState(false);

  const restablecerForm = () => {
    setValores(initialState);
    setCambioValores(false);
  };

  const setearUpdateForm = (valuesUpdate) => {
    setValores(valuesUpdate);
    setCambioValores(false);
  };

  const setValoresForm = ({ target }) => {
    setValores({
      ...valores,
      [target.name]: target.type === "checkbox" ? target.checked : target.value,
    });
    setCambioValores(true);
  };

  return [
    valores,
    setValoresForm,
    restablecerForm,
    setearUpdateForm,
    cambioValores,
  ];
};
