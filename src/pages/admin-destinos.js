// src/pages/admin-destinos.js

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";
import { useRouter } from "next/router"; // <--- Import para redirección
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import {
  addDoc,
  collection,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { uploadImage } from "../supabase";
import { useAuth } from "../context/AuthContext"; // <--- Importar tu AuthContext

const createDestino = async (destinoData, imageFile) => {
  const imageUrl = await uploadImage(imageFile, "avilamet-perfil", "destinos");
  await addDoc(collection(db, "destinos"), {
    foto: imageUrl,
    nombre: destinoData.nombre,
    duracion: destinoData.duracion,
    dificultad: destinoData.dificultad,
    link_google_map: destinoData.link_google_map,
    descripcion: destinoData.descripcion,
  });
};

const AdminDestinos = () => {
  // --- Verificación de rol ADMIN ---
  const { user, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Esperar a que termine el authLoading
    if (!authLoading) {
      // Si no hay usuario o no es admin => redirige
      if (!user || user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  // Si está cargando la auth, retornamos null (o un spinner) para no ver parpadeos
  if (authLoading) {
    return null;
  }
  // Si ya hay user pero no es admin, también retornamos null para evitar pintarlo
  if (user && user.role !== "admin") {
    return null;
  }

  // ==================== SECCIÓN: LISTADO DE DESTINOS ====================
  const [destinosList, setDestinosList] = useState([]);
  const [loadingDestinosList, setLoadingDestinosList] = useState(true);
  const [errorList, setErrorList] = useState("");

  const loadDestinos = async () => {
    try {
      setLoadingDestinosList(true);
      setErrorList("");
      const snapshot = await getDocs(collection(db, "destinos"));
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setDestinosList(data);
    } catch (err) {
      console.error("Error al cargar destinos:", err);
      setErrorList("Error al cargar destinos.");
    } finally {
      setLoadingDestinosList(false);
    }
  };

  useEffect(() => {
    loadDestinos();
  }, []);

  const handleDeleteDestino = async (destino) => {
    const confirm = window.confirm(
      `¿Estás seguro de que deseas eliminar el destino con ID: ${destino.id}?`
    );
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, "destinos", destino.id));
      setDestinosList((prev) => prev.filter((d) => d.id !== destino.id));
    } catch (err) {
      console.error("Error al eliminar destino", err);
      alert("Ocurrió un error al eliminar el destino.");
    }
  };

  // ==================== CREACIÓN DE DESTINO ====================
  const [showCreationForm, setShowCreationForm] = useState(false);
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
      // Limpiar
      setFormData({
        nombre: "",
        duracion: "",
        dificultad: "",
        link_google_map: "",
        descripcion: "",
      });
      setImageFile(null);

      loadDestinos();
    } catch (err) {
      console.error("Error al crear el destino:", err);
      setError(err.message);
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      <Header title="Admin Destinos" />
      <BackgroundLayout>
        <Container
          maxWidth="md"
          sx={{ py: 4, zIndex: 2, position: "relative" }}
        >
          <Typography variant="h4" align="center" sx={{ mb: 3, color: "#fff" }}>
            Administrador de Destinos
          </Typography>

          {/* LISTA DE DESTINOS EXISTENTES */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Destinos Disponibles
            </Typography>

            {errorList && (
              <Typography color="error" sx={{ mb: 2 }}>
                {errorList}
              </Typography>
            )}

            {loadingDestinosList ? (
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress size={24} />
              </Box>
            ) : destinosList.length === 0 ? (
              <Typography>No hay destinos creados todavía.</Typography>
            ) : (
              destinosList.map((dest) => (
                <Box
                  key={dest.id}
                  sx={{
                    border: "1px solid #ccc",
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box sx={{ textAlign: "left" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      ID: {dest.id}
                    </Typography>
                    <Typography variant="body2">
                      Nombre: {dest.nombre || "N/D"}
                    </Typography>
                    <Typography variant="body2">
                      Duración: {dest.duracion || "N/D"}
                    </Typography>
                    <Typography variant="body2">
                      Dificultad: {dest.dificultad || "N/D"}
                    </Typography>
                    <Typography variant="body2">
                      Google Maps:{" "}
                      {dest.link_google_map ? (
                        <a
                          href={dest.link_google_map}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Ver mapa
                        </a>
                      ) : (
                        "N/D"
                      )}
                    </Typography>
                    <Typography variant="body2">
                      Descripción: {dest.descripcion || "N/D"}
                    </Typography>
                    {dest.foto && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Foto:{" "}
                        <a href={dest.foto} target="_blank" rel="noreferrer">
                          Ver imagen
                        </a>
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteDestino(dest)}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Box>
              ))
            )}
          </Paper>

          {/* BOTÓN PARA MOSTRAR/OCULTAR FORMULARIO */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowCreationForm(!showCreationForm)}
            >
              {showCreationForm ? "Ocultar Formulario" : "Crear Destino"}
            </Button>
          </Box>

          {/* FORMULARIO CREACIÓN DESTINO */}
          {showCreationForm && (
            <Box
              sx={{
                p: 4,
                bgcolor: "white",
                borderRadius: 3,
                boxShadow: 6,
                mb: 4,
              }}
            >
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
                {/* Campos */}
                <TextField
                  label="Nombre del destino"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  fullWidth
                  required
                />
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

                <TextField
                  label="Link de Google Maps"
                  name="link_google_map"
                  value={formData.link_google_map}
                  onChange={handleChange}
                  fullWidth
                  required
                />
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
          )}
        </Container>
      </BackgroundLayout>
    </>
  );
};

export default AdminDestinos;
