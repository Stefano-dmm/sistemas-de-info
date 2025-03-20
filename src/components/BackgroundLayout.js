// src/components/BackgroundLayout.js
import React from "react";
import { Box } from "@mui/material";

const BackgroundLayout = ({ children }) => {
  return (
    <>
      {/* Imagen de fondo fija */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: `url("/avila.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          zIndex: -2,
        }}
      />
      {/* Overlay más oscuro */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)", // Más oscuro que 0.3
          zIndex: -1,
        }}
      />
      {children}
    </>
  );
};

export default BackgroundLayout;
