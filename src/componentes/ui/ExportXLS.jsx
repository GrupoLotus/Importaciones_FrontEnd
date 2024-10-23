import * as ExcelJS from "exceljs";

export const ExportXLS = async (datos, nombreArchivo = "Reporte.xlsx") => {
  if (!datos || datos.length === 0) {
    console.error("No hay datos para generar el Excel");
    return;
  }

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Datos");

  // Obtener las columnas de los datos
  const Titulos = Object.keys(datos[0]);
  const Registros = datos.map((registro) =>
    Titulos.map((propiedad) => registro[propiedad])
  );

  // Crear la tabla
  ws.addTable({
    name: "Tabla",
    ref: "A1",
    headerRow: true,
    totalsRow: false,
    style: {
      theme: "TableStyleLight9",
      showRowStripes: true,
    },
    columns: Titulos.map((Titulo) => ({ name: Titulo.replace("_", " ") })),
    rows: Registros,
  });

  // Centrar verticalmente y horizontalmente los títulos
  ws.getRow(1).alignment = {
    vertical: "middle",
    horizontal: "center",
    wrapText: true,
  };

  // Ajustar el ancho de las columnas
  Titulos.forEach((titulo, index) => {
    const col = ws.getColumn(index + 1);
    let maxLength = titulo.length;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    col.width = maxLength < 10 ? 10 : maxLength + 3;
  });

  // Generar y descargar el archivo Excel
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Crear un enlace temporal y hacer clic en él para descargar
  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = nombreArchivo;
  link.click();
  window.URL.revokeObjectURL(link.href);
};
