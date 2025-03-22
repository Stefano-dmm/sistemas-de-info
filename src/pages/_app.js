import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme"; // Asegúrate de que la ruta sea correcta
import { AuthProvider } from "../context/AuthContext";
import "@/styles/globals.css";
import Head from "next/head";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>AvilaMET</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
