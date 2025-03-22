// src/pages/donativos.js
import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";

const Donativos = () => {
  const [open, setOpen] = useState(false);

  const handleOpenDialog = () => setOpen(true);
  const handleCloseDialog = () => setOpen(false);

  // Función para redirigir a PayPal en una nueva pestaña
  const handleDonateWithPayPal = () => {
    window.open("https://www.paypal.com/signin", "_blank");
  };

  return (
    <>
      <Header title="Donativos" />
      <BackgroundLayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            color: "#fff",
            textAlign: "center",
            py: 4,
          }}
        >
          <Typography variant="h3" sx={{ mb: 2 }}>
            DONATIVOS
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
            {/* Mensaje principal */}
            <Box
              sx={{
                backgroundColor: "#fff",
                color: "#000",
                p: 4,
                borderRadius: 2,
                boxShadow: 2,
                mb: 4,
              }}
            >
              <Typography variant="h5">IMPORTANTE</Typography>
              <Typography variant="body1">
                Muchas gracias por todo y cada uno de los donativos que deseen
                llevar a cabo. Estos donativos van directamente a la mejora de
                la experiencia que podemos otorgarles a todos y cada uno de
                ustedes, y en caso de no usar nuestro servicio y realizar
                donativo estamos agradecidos con usted por su gentileza con los
                usuarios.
              </Typography>
            </Box>

            {/* Logo */}
            <Box sx={{ mb: 4 }}>
              <img
                src="/logo.png"
                alt="Logo AvilaMET"
                style={{ width: 100, height: "auto" }}
              />
            </Box>

            {/* Botón Donar con ícono */}
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                color="success"
                onClick={handleOpenDialog}
                sx={{
                  textTransform: "none",

                  borderRadius: "8px",
                  px: 3,
                  py: 1.5,
                }}
                startIcon={<ArrowForwardIcon />}
              >
                Donar
              </Button>
            </Box>
          </Container>
        </Box>

        {/* Popup (Dialog) simulando proceso de pago con PayPal */}
        <Dialog open={open} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
          <DialogTitle
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h6">Donar con PayPal</Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Gracias por tu interés en apoyar nuestro proyecto. Por favor, haz
              clic en el botón para proceder con tu donación a través de PayPal.
            </Typography>
            {/* Botón que redirige a PayPal */}
            <Button
              variant="contained"
              color="success"
              onClick={handleDonateWithPayPal}
            >
              Donar con PayPal
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="inherit">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      </BackgroundLayout>
    </>
  );
};

export default Donativos;
