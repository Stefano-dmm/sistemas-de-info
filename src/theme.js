// theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    // Esta configuración hará que Coustard sea la fuente principal para todo el sitio
    fontFamily: "'Coustard', serif",
    // Opcional: puedes definir variantes específicas
    allVariants: {
      fontWeight: 400, // Cambia el 400 por el valor que desees
    },
  },
  palette: {
    primary: { main: "#169505" },
    text: { primary: "#000" },
  },
  // Puedes agregar aquí más configuraciones de componentes
});

export default theme;
