import { useCallback, useState } from "react";
import { Container } from "react-bootstrap";
import { useDropzone } from "react-dropzone";
import "../../styles/fileUpload.css";

export const CargaDescargaFile = ({ onFileUpload, setFileError }) => {
  //Evento adicional si en el futuro se desea implementar el http desde el componenten padre
  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      onFileUpload(file);
    },
    [onFileUpload]
  );

  const [msgEspanol, setMsgEspanol] = useState([]);
  const { acceptedFiles, fileRejections, getRootProps, getInputProps } =
    useDropzone({
      onDrop,
      maxFiles: 1,
      maxSize: 20000000, // 20 MB en bytes,
      accept: {
        "application/pdf": [".pdf"],
      },
      onDropRejected: (fileRejections) => {
        setFileError(true);
        const { errors } = fileRejections[0];
        errors.forEach((error) => {
          if (error.code === "file-too-large") {
            setMsgEspanol("El archivo sobrepaso el tamaño limite (20MB)");
          } else if (error.code === "file-invalid-type") {
            setMsgEspanol("Tipo de archivo no permitido");
          } else if (error.code === "too-many-files") {
            setMsgEspanol("Solo puede cargar 1 archivo maximo");
          } else {
            setMsgEspanol(
              `Ha ocurrido un error al cargar el archivo: ${error.message}`
            );
          }
        });
      },
      onDropAccepted: () => {
        setFileError(false);
        setMsgEspanol("");
      },
    });

  const acceptedFileItems = acceptedFiles.map((file) => (
    <li key={file.path}>
      {file.path} - {file.size} bytes
    </li>
  ));

  return (
    <div className="container">
      <Container {...getRootProps({ className: "areaDragAndDrop" })}>
        <input {...getInputProps()} />
        <i className="bi bi-filetype-pdf" style={{ fontSize: "3rem" }}></i>
        <p>Arrastra y suelta el archivo aquí o haz clic para seleccionarlo</p>
        <em>(1 archivo maximo, Tamaño maximo 20MB)</em>
      </Container>
      <aside className="mt-4">
        {/*acceptedFileItems.length > 0 &&
                    <>
                        <h5>Archivos cargados exitosamente</h5>
                        <ul>{acceptedFileItems}</ul>
                    </>*/}

        {fileRejections.length > 0 && (
          <>
            <h5>Archivos no cargados</h5>
            <ul style={{ color: "red" }}>{msgEspanol}</ul>
          </>
        )}
      </aside>
    </div>
  );
};
