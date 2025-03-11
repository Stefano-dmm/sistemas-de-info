import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
} from "@mui/material";
import backgroundImage from "../assets/avila.png";
import Header from "./HeaderNoHome";
import CloseIcon from "@mui/icons-material/Close";

const destinos = [
  {
    nombre: "Sabas Nieves",
    dificultad: "Baja",
    tiempo: "+4 horas",
    imagen: "/destinos/SabasNieves.JPG", // Imagen de ejemplo
    descripcion:
      "Entrada por Altamira. Ruta popular y accesible, ideal para principiantes.",
    googleMapsLink: "https://maps.app.goo.gl/SiUL5ETVWnyajpbn9", // Cambia el enlace con el correcto
  },
  {
    nombre: "La Julia",
    dificultad: "Alta",
    tiempo: "+6 horas",
    imagen: "/destinos/LaJulia.jpg", // Imagen de ejemplo
    descripcion:
      "Entrada por La Floresta. Ruta exigente con vistas espectaculares.",
    googleMapsLink: "https://maps.app.goo.gl/SiUL5ETVWnyajpbn9", // Cambia el enlace con el correcto
  },
  {
    nombre: "El Ávila por Galipán",
    dificultad: "Media",
    tiempo: "+5 horas",
    imagen: "/destinos/Galipan.jpg", // Imagen de ejemplo
    descripcion:
      "Acceso por la carretera a Galipán. Ruta pintoresca con miradores naturales.",
    googleMapsLink: "https://maps.app.goo.gl/SiUL5ETVWnyajpbn9", // Cambia el enlace con el correcto
  },
  {
    nombre: "Pico Naiguatá",
    dificultad: "Alta",
    tiempo: "+8 horas",
    imagen: "/destinos/PicoNaiguata.jpg",
    descripcion:
      "Acceso por Naiguatá. Ruta desafiante para expertos en senderismo.",
    googleMapsLink: "https://maps.app.goo.gl/SiUL5ETVWnyajpbn9",
  },
  {
    nombre: "Cachimbo",
    dificultad: "Baja",
    tiempo: "+3 horas",
    imagen: "/destinos/Cachimbo.jpg",
    descripcion:
      "Entrada por la urbanización Cachimbo. Ruta menos conocida pero hermosa.",
    googleMapsLink: "https://maps.app.goo.gl/SiUL5ETVWnyajpbn9",
  },
  {
    nombre: "Los Venados",
    dificultad: "Media",
    tiempo: "+4 horas",
    imagen: "/destinos/LosVenados.jpeg",
    descripcion:
      "Entrada por el Parque Los Venados. Ideal para un día de trekking.",
    googleMapsLink: "https://maps.app.goo.gl/SiUL5ETVWnyajpbn9",
  },
];

const Destinos = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDestino, setSelectedDestino] = useState(null);

  const handleCardClick = (destino) => {
    setSelectedDestino(destino);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDestino(null);
  };

  return (
    <div>
      <Header />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflowX: "hidden",
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
          width: "100vw",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "#fff",
        }}
      >
        {/* Título Destinos */}
        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
          Destinos
        </Typography>

        {/* Franja divisoria que ocupa todo el ancho */}
        <Box
          sx={{
            width: "100%",
            height: "20px",
            backgroundColor: "#169505", // Verde claro
            my: 3,
          }}
        />

        {/* Grid de Destinos */}
        <Container
          maxWidth="lg"
          disableGutters
          sx={{
            width: "100%",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
          }}
        >
          <Grid container spacing={4} sx={{ mb: 4, width: "100%" }}>
            {destinos.map((destino, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    width: "100%",
                    cursor: "pointer",
                    "&:hover": {
                      transform: "scale(1.05)",
                      transition: "transform 0.3s ease-in-out",
                    },
                  }}
                  onClick={() => handleCardClick(destino)}
                >
                  <CardMedia
                    component="img"
                    height="140"
                    image={destino.imagen}
                    alt={destino.nombre}
                  />
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      {destino.nombre}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Dificultad:</strong> {destino.dificultad}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Tiempo:</strong> {destino.tiempo}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {selectedDestino && (
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          sx={{
            "& .MuiDialog-paper": {
              overflow: "hidden",
            },
          }}
        >
          <DialogTitle>
            {selectedDestino.nombre}
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseDialog}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <img
                src={selectedDestino.imagen}
                alt={selectedDestino.nombre}
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                }}
              />
            </Box>
            <Typography variant="body1">
              <strong>Dificultad:</strong> {selectedDestino.dificultad}
            </Typography>
            <Typography variant="body1">
              <strong>Tiempo:</strong> {selectedDestino.tiempo}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Descripción:</strong> {selectedDestino.descripcion}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              href={selectedDestino.googleMapsLink}
              target="_blank"
              sx={{ mb: 1 }}
            >
              Ver en Google Maps
            </Button>
            <Button variant="contained" color="secondary" sx={{ mb: 1 }}>
              Reservar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
};

export default Destinos;
