import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import { uploadImage } from "../supabase";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export default function GuiaDestinos() {
  // 1) TODOS LOS HOOKS EN LA CABECERA
  const { user, authLoading } = useAuth();
  const router = useRouter();

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    duracion: "",
    dificultad: "",
    link_google_map: "",
    descripcion: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // 3) LUEGO LAS VALIDACIONES DE ROL, ETC.
  if (authLoading) {
    // Mientras carga la auth, evita renderizar
    return null; // O un spinner
  }
  if (!user || user.role !== "guia") {
    // Si no hay user o su rol no es guia, redirige
    router.push("/");
    return null; // Evitas renderizar la UI
  }

  // 3) FUNCIONES
  const isFormValid = () => {
    return (
      formData.nombre.trim() !== "" &&
      formData.duracion.trim() !== "" &&
      formData.dificultad.trim() !== "" &&
      formData.link_google_map.trim() !== "" &&
      formData.descripcion.trim() !== "" &&
      imageFile !== null
    );
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const createDestino = async (destinoData, imageFile) => {
    const imageUrl = await uploadImage(
      imageFile,
      "avilamet-perfil",
      "destinos"
    );
    await addDoc(collection(db, "destinos"), {
      foto: imageUrl,
      nombre: destinoData.nombre,
      duracion: destinoData.duracion,
      dificultad: destinoData.dificultad,
      link_google_map: destinoData.link_google_map,
      descripcion: destinoData.descripcion,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!isFormValid()) {
      setError("Por favor, rellena todos los campos y selecciona una imagen.");
      return;
    }

    setLoadingSubmit(true);
    try {
      await createDestino(formData, imageFile);
      setSuccess(true);
      setFormData({
        nombre: "",
        duracion: "",
        dificultad: "",
        link_google_map: "",
        descripcion: "",
      });
      setImageFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // 4) RENDER DE LA UI
  return (
    <>
      <Header title="Guía: Crear Destino" />
      <BackgroundLayout>
        <Container
          maxWidth="sm"
          sx={{ py: 4, zIndex: 2, position: "relative" }}
        >
          <Box sx={{ p: 4, bgcolor: "white", borderRadius: 3, boxShadow: 6 }}>
            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 3, color: "#000" }}
            >
              Crear Destino
            </Typography>
            {error && (
              <Typography color="error" align="center" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" align="center" sx={{ mb: 2 }}>
                ¡Destino creado exitosamente!
              </Typography>
            )}

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Nombre del destino"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                fullWidth
                required
              />

              {/* Duración */}
              <FormControl fullWidth required>
                <InputLabel id="duracion-label">Duración</InputLabel>
                <Select
                  labelId="duracion-label"
                  name="duracion"
                  value={formData.duracion}
                  onChange={handleChange}
                >
                  <MenuItem value="+3 horas">+3 horas</MenuItem>
                  <MenuItem value="+6 horas">+6 horas</MenuItem>
                  <MenuItem value="+9 horas">+9 horas</MenuItem>
                  <MenuItem value="+12 horas">+12 horas</MenuItem>
                </Select>
              </FormControl>

              {/* Dificultad */}
              <FormControl fullWidth required>
                <InputLabel id="dificultad-label">Dificultad</InputLabel>
                <Select
                  labelId="dificultad-label"
                  name="dificultad"
                  value={formData.dificultad}
                  onChange={handleChange}
                >
                  <MenuItem value="Baja">Baja</MenuItem>
                  <MenuItem value="Media">Media</MenuItem>
                  <MenuItem value="Alta">Alta</MenuItem>
                </Select>
              </FormControl>

              {/* Link de Google Maps */}
              <TextField
                label="Link de Google Maps"
                name="link_google_map"
                value={formData.link_google_map}
                onChange={handleChange}
                fullWidth
                required
              />

              {/* Descripción */}
              <TextField
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                required
              />

              {/* Imagen */}
              <Button variant="contained" component="label" color="primary">
                Seleccionar Imagen
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
              {imageFile && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Imagen seleccionada: {imageFile.name}
                </Typography>
              )}

              <Button
                variant="contained"
                type="submit"
                disabled={loadingSubmit}
                sx={{ mt: 2 }}
              >
                {loadingSubmit ? (
                  <CircularProgress size={24} />
                ) : (
                  "Crear Destino"
                )}
              </Button>
            </Box>
          </Box>
        </Container>
      </BackgroundLayout>
    </>
  );
}
