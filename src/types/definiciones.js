export const types = {
  nombreToken: "x-token",
};

export const defError = {
  errorServer: "Network Error",
  internalServerError: "Request failed with status code 500",
};

export const infoMensajes = {
  errorDeComunicacion: "No es posible comunicarse con el servidor",
  algoSalioMal: "Algo salio mal en el servidor, comunica con tu equipo de IT",
};

export const endPoint = {
  baseURL: "https://us-central1-grupolotus-gt.cloudfunctions.net/api",
  //baseURL: "http://localhost:8050",
  modulo: "/administracion",
  modImport: "/importaciones",
  modArchivo: "/archivos",
  modDespacho: "/despacho",
  modInventario: "/inventario",
  modAyuda: "/ayuda",
  cambioEtapa: "/cambiarEtapa",
  login: "/login",
  usuariosSesion: "/recuperarSesion",
  cambiarContrasena: "/cambiarContrasena",
  epConsulta: "/filtro/",
  roles: "/rol",
  servicioRol: "/servicioRol/",
  usuarios: "/usuario",
  recuperaClave: "/recuperarContrasena",
  import: "/importacion",
  puerto: "/puertos",
  graficaEncImp: "/graficaImpEnc",
  detalleImpor: "/importacionDetalle",
  upDownExcel: "/upDownloadExcel",
  recuperaFile: "/recuperaArchivo",
  upFileDetImp: "/cargaFileDetImpor",
  downFileDetImp: "/descargaFileDetImpo",
  fileXLS: "/Excel/",
  sucursal: "/sucursal",
  despacho: "/despacho",
  downFileDespacho: "/descargaFileDespacho",
  upFileDespacho: "/cargaFileDespacho",
  downPlantDespacho: "/descargaPlantillaDespacho",
  inventario: "/inventario",
  stock: "/stock",
  graficaInventario: "/graficaInventario",
  administraManual: "/administraManuales",
  manual: "/manuales",
  upDownPDF: "/upDownloadPDF",
  fileManual: "/PDFManual",
};

export const datosReload = {
  setTime: 4000,
  statusText: "Unauthorized",
  statusAutorized: 401,
  urlHome: "/menu",
};

export const ESTADOS = {
  A: "Activo",
  E: "Eliminado",
  R: "Rechazado",
  F: "Finalizado",
};
