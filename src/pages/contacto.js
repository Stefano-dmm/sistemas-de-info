// src/pages/contacto.js
import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const Contacto = () => {
  // Estados para el formulario
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    mensaje: "",
  });
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Manejo de cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Envío del formulario a la colección "contacto_usuarios"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validar campos
    if (
      !formData.nombre.trim() ||
      !formData.email.trim() ||
      !formData.mensaje.trim()
    ) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setLoadingSubmit(true);
    try {
      await addDoc(collection(db, "contacto_usuarios"), {
        nombre: formData.nombre,
        email: formData.email,
        mensaje: formData.mensaje,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setFormData({ nombre: "", email: "", mensaje: "" });
    } catch (err) {
      console.error("Error al enviar contacto:", err);
      setError("Hubo un error al enviar tu mensaje.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      <Header title="Contacto" />
      <BackgroundLayout>
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
            Contacto
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
            <Grid container spacing={4}>
              {/* Sección con datos de contacto y mapa */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    mb: 2,
                    backgroundColor: "rgba(255,255,255,0.9)",
                  }}
                >
                  <Typography variant="h5">Datos de Contacto</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Teléfono: +58 212-240-3511
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Email: info@avilamet.com
                  </Typography>

                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Dirección: Universidad Metropolitana, Terrazas del Ávila,
                    Caracas, Venezuela.
                  </Typography>
                </Paper>

                {/* Mapa de Google Maps */}
                <Paper
                  sx={{
                    p: 0,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    title="Mapa Universidad Metropolitana"
                    src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d31383.959120838932!2d-66.778178!3d10.501068!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a576d54142307%3A0x346aa4e5e126367e!2sUniversidad%20Metropolitana!5e0!3m2!1ses!2sve!4v1742460557600!5m2!1ses!2sve"
                    width="100%"
                    height="300"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </Paper>
              </Grid>

              {/* Formulario de contacto */}
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.9)",
                  }}
                >
                  <Typography variant="h5">Envíanos tu mensaje</Typography>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                      ¡Tu mensaje ha sido enviado con éxito!
                    </Alert>
                  )}
                  <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <TextField
                      label="Nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Correo electrónico"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      type="email"
                      fullWidth
                      required
                    />
                    <TextField
                      label="Mensaje"
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      multiline
                      rows={4}
                      fullWidth
                      required
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      disabled={loadingSubmit}
                      sx={{ height: 48 }}
                    >
                      {loadingSubmit ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Enviar"
                      )}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </BackgroundLayout>
    </>
  );
};

export default Contacto;
