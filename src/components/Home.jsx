import React from "react";
import Header from "./Header";
import { Container, Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import backgroundImage from "../assets/avila.png";
import logoImage from "../assets/logo.png";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Header />

      {/* Contenedor principal */}
      <Box sx={{ position: "relative", height: "100vh", width: "100vw" }}>
        {/* Fondo con overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        />

        {/* Contenido principal */}
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            color: "#fff",
          }}
        >
          <Typography variant="h3" align="center" sx={{ mb: 2 }}>
            HOME
          </Typography>

          {/* Franja divisoria */}
          <Box
            sx={{
              width: "100%",
              height: "20px",
              backgroundColor: "#169505",
              my: 3,
            }}
          />

          {/* Contenedor de contenido principal */}
          <Container
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: "1200px",
              px: 2,
            }}
          >
            {/* Sección izquierda (Texto + Logo) */}
            <Box
              sx={{
                textAlign: { xs: "center", md: "left" },
                maxWidth: "400px",
              }}
            >
              {/* Contenedor que agrupa imagen + título */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                  mb: 2,
                }}
              >
                <Box
                  component="img"
                  src={logoImage}
                  alt="AvilaMET logo"
                  sx={{ width: 50, height: "auto", mr: 2 }}
                />
                <Typography variant="h4">AvilaMET</Typography>
              </Box>

              {/* Texto debajo del título */}
              <Typography variant="body1">
                Subir ya es costumbre de todo alumno de la Unimet
              </Typography>
            </Box>

            {/* Sección derecha (Botonera) */}
            <Stack spacing={2} sx={{ mt: { xs: 3, md: 0 } }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => navigate("/Destinos")}
              >
                Destinos
              </Button>
              <Button
                variant="contained"
                color="success"
                //onClick={() => navigate("/calendario")}
              >
                Calendario
              </Button>
              <Button
                variant="contained"
                color="success"
                //onClick={() => navigate("/reservas")}
              >
                Reservas
              </Button>
              <Button
                variant="contained"
                color="success"
                //onClick={() => navigate("/foro")}
              >
                Foro
              </Button>
              <Button
                variant="contained"
                color="success"
                // onClick={() => navigate("/informacion")}
              >
                Información
              </Button>
              <Button
                variant="contained"
                color="success"
                //onClick={() => navigate("/donativos")}
              >
                Donativos
              </Button>
              <Button
                variant="contained"
                color="success"
                // onClick={() => navigate("/galeria")}
              >
                Galería
              </Button>
            </Stack>
          </Container>
        </Box>
      </Box>
    </div>
  );
};

export default Home;
