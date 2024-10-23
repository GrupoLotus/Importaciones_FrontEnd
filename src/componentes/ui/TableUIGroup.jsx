import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleDensePaddingButton,
} from "material-react-table";
import { MRT_Localization_ES } from "material-react-table/locales/es";
import { useState } from "react";
import { Box, IconButton, Tooltip, Stack } from "@mui/material";
import { Form } from "react-bootstrap";
import { Space, Grid } from "antd";

const TableUIGroup = ({
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
    console.log("Exportando a registros", exportData);
  };

  const exportarData = () => {
    console.log("Exportando a Data", tabla.data);
  };

  const excluidasEditar = [];
  const excluidasEliminar = [];
  const excluidasVer = [];
  const excluirFiltrosFiltros = [];

  return (
    <div className="container-table mt-3 mb-5">
      <MaterialReactTable
        columns={tabla.columnas} //Columnas
        data={tabla.data} //Información
        localization={MRT_Localization_ES} //Coloca la tabla en español
        displayColumnDefOptions={{
          "mrt-row-expand": {
            enableResizing: true,
          },
        }}
        enableColumnResizing={true}
        enableGrouping={true}
        enableStickyHeader={true}
        enableStickyFooter={true}
        //columnFilterDisplayMode= "popover" //Scroll horizontal, popover (si scroll) y custom (ajustar)
        initialState={{
          showGlobalFilter: true,
          density: "compact",
          grouping: tabla.agrupacion,
          sorting: [{ id: "BL_IMPORTACION", desc: false }],
        }} //showGlobalFilter: mostrar el buscador inicial. density: Espaciado entre filas 'comfortable' | 'compact' | 'spacious'
        positionActionsColumn="first"
        onPaginationChange={setPagination}
        state={{ pagination }}
        muiTableContainerProps={{
          style: { maxHeight: "60vh", minHeight: "50vh" },
        }}
        muiTablePaperProps={{ elevation: 5, sx: { m: "auto", maxWidth: 5000 } }}
        enableRowActions={tabla.data.length > 0 ? true : false}
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
            </Box>
          )
        }
      />
    </div>
  );
};

export default TableUIGroup;
