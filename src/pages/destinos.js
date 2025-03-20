// src/pages/destinos.js
import React, { useEffect, useState } from "react";
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
import Header from "../components/Header";
import CloseIcon from "@mui/icons-material/Close";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const Destinos = () => {
  const [destinos, setDestinos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDestino, setSelectedDestino] = useState(null);

  // Consulta la colección "destinos" en Firestore
  useEffect(() => {
    const fetchDestinos = async () => {
      try {
        // Opcional: ordenar por nombre o cualquier otro campo
        const q = query(collection(db, "destinos"), orderBy("nombre", "asc"));
        const querySnapshot = await getDocs(q);
        const destinosData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDestinos(destinosData);
      } catch (error) {
        console.error("Error al obtener destinos:", error);
      }
    };

    fetchDestinos();
  }, []);

  const handleCardClick = (destino) => {
    setSelectedDestino(destino);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDestino(null);
  };

  return (
    <>
      <Header />
      {/* Fondo con overlay (se puede dejar el mismo que antes o usar BackgroundLayout) */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          overflowX: "hidden",
          backgroundImage: `url("/avila.png")`,
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
        <Typography variant="h3" align="center" sx={{ mb: 2 }}>
          Destinos
        </Typography>
        <Box
          sx={{
            width: "100%",
            height: "20px",
            backgroundColor: "#169505",
            my: 3,
          }}
        />
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
              <Grid item xs={12} md={4} key={destino.id || index}>
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
                    image={destino.foto}
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
                      <strong>Tiempo:</strong> {destino.duracion}
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
                src={selectedDestino.foto}
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
              <strong>Duración:</strong> {selectedDestino.duracion}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Descripción:</strong> {selectedDestino.descripcion}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              href={selectedDestino.link_google_map}
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
    </>
  );
};

export default Destinos;
