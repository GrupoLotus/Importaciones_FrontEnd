import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleDensePaddingButton,
} from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Form } from "react-bootstrap";
import { Space, Grid } from "antd";
import { ExportXLS } from "./ExportXLS";

const TableUI = ({
  tabla,
  onClicActions,
  pantalla,
  filtros,
  setFiltros,
  switches,
}) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 25,
  });
  const { useBreakpoint } = Grid;
  const { md } = useBreakpoint();

  if (typeof tabla === "undefined") {
    return;
  }

  const exportarRegistros = (rows, columns) => {
    let visibleColumns = columns.filter(
      (column) => !column.id.startsWith("mrt-row-actions")
    );
    const visibleColumnKeys = visibleColumns.map((column) => column.id);
    // Crear un nuevo array con solo las filas filtradas y las columnas visibles
    const exportData = rows.map((row) => {
      const rowData = {};
      visibleColumnKeys.forEach((key) => {
        rowData[key] = row.getValue(key);
      });
      return rowData;
    });
    ExportXLS(exportData, `REPORTE ${pantalla}.xlsx`);
  };

  const exportarData = () => {
    console.log("Exportando a Data", tabla.data);
    const a = ExportXLS(
      (datos = tabla.data),
      (nombreArchivo = `REPORTE ${pantalla}.xlsx`)
    );
  };

  const excluidasEditar = ["INVENTARIO", "STOCK", "MANUALES"];
  const excluidasEliminar = ["INVENTARIO", "STOCK", "MANUALES"];
  const excluidasVer = ["MANUALES"];
  const excluirFiltrosFiltros = ["INVENTARIO", "STOCK", "MANUALES"];
  const incluirCargaExcel = ["DETALLE IMPORTACIONES", "DESPACHOS"];
  const incluirDescargaExcel = ["DETALLE IMPORTACIONES", "DESPACHOS"];
  const excluidaAcciones = ["STOCK"];
  const incluirCargaPDF = ["DOCUMENTOS DE APOYO"];
  const incluirVIstaPDF = ["MANUALES"];

  return (
    <div className="container-table mt-3 mb-5">
      <MaterialReactTable
        columns={tabla.columnas} //Columnas
        data={tabla.data} //Información
        localization={MRT_Localization_ES} //Coloca la tabla en español
        positionActionsColumn="first" //Donde Pondrá las acciones al inicio o final
        //columnFilterDisplayMode= "popover" //Scroll horizontal, popover (si scroll) y custom (ajustar)
        initialState={{ showGlobalFilter: true, density: "compact" }} //showGlobalFilter: mostrar el buscador inicial. density: Espaciado entre filas 'comfortable' | 'compact' | 'spacious'
        onPaginationChange={setPagination} //Establece cantidad de registros por pagina
        state={{ pagination }}
        paginationDisplayMode="pages" //mostrar las paginas totales abajo, 1, 2, 3, 4, ...
        muiTableContainerProps={{
          style: { maxHeight: "60vh", minHeight: "50vh" },
        }} //Tamaño de la tabla
        muiTablePaperProps={{ elevation: 5, sx: { m: "auto", maxWidth: 5000 } }}
        enableStickyHeader //Mantener los encabezados en la tabla
        enableRowActions={
          tabla.data.length > 0 && !excluidaAcciones.includes(pantalla)
            ? true
            : false
        } //Muestra las Acciones
        renderRowActions={({ row }) =>
          row.original.ESTADO !== "Eliminado" &&
          row.original.ESTADO !== "" && (
            <Box sx={{ display: "flex", gap: "0rem" }}>
              {!excluidasEditar.includes(pantalla) &&
                row.original.ESTADO !== "Finalizado" && (
                  <Tooltip arrow placement="left" title="Editar">
                    <IconButton
                      style={{ color: "#FFA420" }}
                      onClick={() =>
                        onClicActions(2, row.original.ID, row.original)
                      }
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </IconButton>
                  </Tooltip>
                )}
              {!excluidasEliminar.includes(pantalla) &&
                row.original.ESTADO !== "Finalizado" && (
                  <Tooltip arrow placement="left" title="Eliminar">
                    <IconButton
                      style={{ color: "RED" }}
                      onClick={() =>
                        onClicActions(3, row.original.ID, row.original)
                      }
                    >
                      <i className="bi bi-trash"></i>
                    </IconButton>
                  </Tooltip>
                )}
              {!excluidasVer.includes(pantalla) && (
                /*(row.original.ESTADO === "Finalizado" ||
                  row.original.ESTADO === "Modificado") &&*/ <Tooltip
                  arrow
                  placement="left"
                  title="Ver"
                >
                  <IconButton
                    style={{ color: "#00AC00" }}
                    onClick={() =>
                      onClicActions(5, row.original.ID, row.original)
                    }
                  >
                    <i className="bi bi-eye"></i>
                  </IconButton>
                </Tooltip>
              )}
              {pantalla == "USUARIOS" && row.original.ESTADO === "Activo" && (
                <Tooltip arrow placement="left" title="Restablecer contraseña">
                  <IconButton
                    color="primary"
                    onClick={() =>
                      onClicActions(4, row.original.ID, row.original)
                    }
                  >
                    <i className="bi bi-arrow-clockwise"></i>
                  </IconButton>
                </Tooltip>
              )}
              {incluirCargaExcel.includes(pantalla) &&
                row.original.ESTADO !== "Finalizado" && (
                  <Tooltip arrow placement="left" title="Cargar Excel">
                    <IconButton
                      style={{ color: "blue" }}
                      onClick={() =>
                        onClicActions(12, row.original.ID, row.original)
                      }
                    >
                      <i className="bi bi-table"></i>
                    </IconButton>
                  </Tooltip>
                )}
              {incluirDescargaExcel.includes(pantalla) &&
                row.original.DETALLES > 0 && (
                  <Tooltip arrow placement="left" title="Descarga Excel">
                    <IconButton
                      style={{ color: "#008f39" }}
                      onClick={() =>
                        onClicActions(13, row.original.ID, row.original)
                      }
                    >
                      <i className="bi bi-filetype-xlsx"></i>
                    </IconButton>
                  </Tooltip>
                )}
              {incluirCargaPDF.includes(pantalla) && (
                <Tooltip arrow placement="left" title="Adjuntar">
                  <IconButton
                    style={{ color: "RED" }}
                    onClick={() =>
                      onClicActions(6, row.original.ID, row.original)
                    }
                  >
                    <i className="bi bi-file-earmark-pdf"></i>
                  </IconButton>
                </Tooltip>
              )}
              {incluirVIstaPDF.includes(pantalla) &&
                row.original.NOMBRE_ARCHIVO && (
                  <Tooltip arrow placement="left" title="Ver">
                    <IconButton
                      style={{ color: "RED" }}
                      onClick={() =>
                        onClicActions(6, row.original.ID, row.original)
                      }
                    >
                      <i className="bi bi-file-earmark-pdf"></i>
                    </IconButton>
                  </Tooltip>
                )}
            </Box>
          )
        }
        muiTableBodyProps={{
          //Tabla rayada
          sx: {
            "& tr:nth-of-type(odd) > td": {
              //Filas para columnas es "'& td:nth-of-type(odd)': {"
              backgroundColor: "#f5f5f5", //Tabla rayada
            },
          },
        }}
        enableToolbarInternalActions={true} //Mostrar mas iconos en el cuadro de busqueda
        renderToolbarInternalActions={(
          { table } //Iconos a mostrar despues de la Busqueda
        ) => (
          <Box
            sx={{
              display: "flex",
              gap: "0px",
              padding: "0px",
              flexWrap: "wrap",
            }}
          >
            {md ? (
              <>
                <Tooltip title="Descargar Reporte">
                  <IconButton
                    onClick={() =>
                      exportarRegistros(
                        table.getFilteredRowModel().rows,
                        table.getVisibleLeafColumns()
                      )
                    }
                  >
                    <i className="bi bi-filetype-xlsx"></i>
                  </IconButton>
                </Tooltip>
                <MRT_ToggleFiltersButton table={table} />
                <MRT_ShowHideColumnsButton table={table} />
              </>
            ) : null}
            <MRT_ToggleFullScreenButton table={table} />
            {/*<MRT_ToggleDensePaddingButton table={table} /> //Eliminado por no ser necesario*/}
          </Box>
        )}
        renderTopToolbarCustomActions={({ row }) => {
          return (
            //Pintar switches para la pantalla ESPECIFICAS dinamicamente en base a json
            <Space
              size="small"
              direction={md ? "horizontal" : "vertical"}
              className="filtroUI"
            >
              {!excluirFiltrosFiltros.includes(pantalla) &&
                switches.map((elemento, index) => {
                  const propiedades = Object.keys(elemento);
                  return propiedades.map((propiedad, i) => {
                    return (
                      <Form.Check
                        label={propiedad}
                        name={propiedad}
                        type="switch"
                        id={propiedad}
                        checked={filtros[propiedad]}
                        onChange={setFiltros}
                        key={`${index}${i}`}
                      />
                    );
                  });
                })}
            </Space>
          );
        }}
      />
    </div>
  );
};

export default TableUI;
