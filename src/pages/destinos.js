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
import BackgroundLayout from "../components/BackgroundLayout";
import CloseIcon from "@mui/icons-material/Close";
import { useRouter } from "next/router";
import { db } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";

const Destinos = () => {
  const router = useRouter();
  const [destinos, setDestinos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDestino, setSelectedDestino] = useState(null);

  // Consulta la colección "destinos" en Firestore
  useEffect(() => {
    const fetchDestinos = async () => {
      try {
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
      <BackgroundLayout>
        {/* Contenido principal */}
        <Box
          sx={{
            width: "100vw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            color: "#fff",
            position: "relative",
            zIndex: 2,
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
                        Dificultad:{destino.dificultad}
                      </Typography>
                      <Typography variant="body1">
                        Tiempo: {destino.duracion}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </BackgroundLayout>

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
              Dificultad: {selectedDestino.dificultad}
            </Typography>
            <Typography variant="body1">
              Duración: {selectedDestino.duracion}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              Descripción: {selectedDestino.descripcion}
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
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push("/calendario")}
              sx={{ mb: 1 }}
            >
              Reservar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default Destinos;
