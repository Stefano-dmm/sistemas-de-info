// src/components/Layout.js
import React from "react";
import { Box, Container, Typography } from "@mui/material";
import Header from "./Header";

const Layout = ({ children, title }) => {
  return (
    <>
      <Header />
      {/* Fondo de pantalla con overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url("/avila.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
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
      {/* Banner con título de la vista */}
      {title && (
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            py: 2,
            textAlign: "center",
          }}
        >
          <Typography variant="h3" align="center" sx={{ color: "#fff", mb: 2 }}>
            {title}
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: "20px",
              backgroundColor: "#169505",
              mb: 3,
            }}
          />
        </Box>
      )}
      {/* Contenedor del contenido principal */}
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 2,
          mb: 4,
        }}
      >
        {children}
      </Container>
    </>
  );
};

export default Layout;
