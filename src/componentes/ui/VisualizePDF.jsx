import { useEffect, useRef } from "react";

export const VisualizePDF = ({ pdfBlob }) => {
  const embedRef = useRef(null);
  let existePDF = true;
  useEffect(() => {
    if (pdfBlob) {
      const pdfURL = URL.createObjectURL(pdfBlob);
      embedRef.current.src = pdfURL;
    }

    return () => {
      // Liberar la URL del objeto Blob cuando el componente se desmonte
      if (embedRef.current) {
        URL.revokeObjectURL(embedRef.current.src);
      }
    };
  }, [pdfBlob]);

  return (
    <>
      <div>
        <embed
          ref={embedRef}
          type="application/pdf"
          width="100%"
          height="600px"
        />
      </div>
    </>
  );
};
