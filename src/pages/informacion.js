// src/pages/informacion.js
import React from "react";
import { Container, Box, Typography, Button, Grid } from "@mui/material";
import { useRouter } from "next/router";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import Image from "next/image";

const Informacion = () => {
  const router = useRouter();

  return (
    <>
      <Header title="Información" />
      <BackgroundLayout>
        {/* Sección principal */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            textAlign: "center",
            py: 4,
            minHeight: "100vh",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2 }}>
            INFORMACIÓN
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: "20px",
              backgroundColor: "#169505",
              mb: 3,
            }}
          />
          <Container maxWidth="md">
            {/* Sección de "IMPORTANTE" */}
            <Box
              sx={{
                backgroundColor: "rgba(255,255,255,0.9)",
                color: "#000",
                p: 3,
                borderRadius: 2,
                mb: 4,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
                IMPORTANTE
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Se recuerda que la seguridad es vital en todo momento, las
                excursiones están principalmente enfocadas a la recreación y
                relajación de los usuarios. Se recomienda preparación para los
                largos trayectos. Si desea consejos de excursión para mejorar su
                experiencia nuestra sección de información está disponible,
                siempre con la intención de que no se ponga en riesgo la
                convivencia de los usuarios. ¡Gracias por su ayuda y
                participación!
              </Typography>

              {/* Imagen con signo de interrogación */}
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <Image
                  src="/question.png" // Ajusta la ruta de tu imagen
                  alt="Pregunta"
                  width={100}
                  height={100}
                  style={{ objectFit: "contain" }}
                />
              </Box>
            </Box>

            {/* Sección de Botones */}
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                  onClick={() => router.push("/donativos")}
                >
                  Donaciones
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  sx={{ textTransform: "none", fontWeight: "bold" }}
                  onClick={() => router.push("/foro")}
                >
                  Foro
                </Button>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </BackgroundLayout>
    </>
  );
};

export default Informacion;
