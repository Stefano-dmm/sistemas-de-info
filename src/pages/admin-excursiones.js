// src/pages/admin-excursiones.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Paper,
  Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const AdminExcursiones = () => {
  // --- Verificación de rol ADMIN ---
  const { user, authLoading } = useAuth();
  const router = useRouter();
  const [excursionsList, setExcursionsList] = useState([]);
  const [loadingExcursionsList, setLoadingExcursionsList] = useState(true);
  const [errorList, setErrorList] = useState("");
  useEffect(() => {
    loadExcursions();
  }, []);
  // ================== Sección para CREAR excursiones ==================
  const [showCreationForm, setShowCreationForm] = useState(false);

  // Estados del formulario
  const [destinoId, setDestinoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [cupoMaximo, setCupoMaximo] = useState(8);
  const [indicaciones, setIndicaciones] = useState("");
  const [guia, setGuia] = useState("");

  // Para cargar destinos y guías
  const [destinos, setDestinos] = useState([]);
  const [guias, setGuias] = useState([]);
  const [loadingDestinos, setLoadingDestinos] = useState(true);
  const [loadingGuias, setLoadingGuias] = useState(true);

  // Estados de feedback para crear
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const fetchDestinos = async () => {
      try {
        setLoadingDestinos(true);
        const querySnapshot = await getDocs(collection(db, "destinos"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDestinos(data);
      } catch (err) {
        console.error("Error al cargar destinos", err);
        setError("Error al cargar destinos");
      } finally {
        setLoadingDestinos(false);
      }
    };
    fetchDestinos();
  }, []);

  // Cargar guías (usuarios con rol "guia")
  useEffect(() => {
    const fetchGuias = async () => {
      try {
        setLoadingGuias(true);
        const q = query(collection(db, "users"), where("role", "==", "guia"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGuias(data);
      } catch (err) {
        console.error("Error al cargar guías", err);
        setError("Error al cargar guías");
      } finally {
        setLoadingGuias(false);
      }
    };
    fetchGuias();
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        // Si no hay user o no es admin, redirigimos a home
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  // Si sigue cargando auth, no renderizamos nada (ni la redirección)
  if (authLoading) return null;
  // Si ya hay user pero su rol NO es admin, retornamos null para que no pinte nada
  if (user && user.role !== "admin") return null;

  // ================== Sección para LISTADO de excursiones ==================

  const loadExcursions = async () => {
    try {
      setLoadingExcursionsList(true);
      setErrorList("");
      const snapshot = await getDocs(collection(db, "excursiones"));
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setExcursionsList(data);
    } catch (err) {
      console.error("Error al cargar excursiones:", err);
      setErrorList("Error al cargar excursiones.");
    } finally {
      setLoadingExcursionsList(false);
    }
  };

  // Función para ELIMINAR una excursión
  const handleDeleteExcursion = async (excursion) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar la excursión con ID: ${excursion.id}?`
    );
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "excursiones", excursion.id));
      setExcursionsList((prev) => prev.filter((ex) => ex.id !== excursion.id));
    } catch (err) {
      console.error("Error al eliminar la excursión", err);
      alert("Ocurrió un error al eliminar la excursión.");
    }
  };

  // Cargar destinos desde Firestore

  // Maneja la creación de Excursión
  const handleCreateExcursion = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validación de campos
    if (!destinoId || !fecha || !cupoMaximo || !indicaciones || !guia) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    if (Number(cupoMaximo) < 8) {
      setError("El cupo máximo debe ser de al menos 8 personas.");
      return;
    }

    // Verificar destino seleccionado
    const destinoSeleccionado = destinos.find((d) => d.id === destinoId);
    if (!destinoSeleccionado) {
      setError("Destino no encontrado.");
      return;
    }

    setLoadingSubmit(true);
    try {
      // Convertimos la fecha a un objeto Date a medianoche
      const selectedDate = new Date(fecha);
      selectedDate.setHours(0, 0, 0, 0);

      // Crear la excursión en Firestore
      await addDoc(collection(db, "excursiones"), {
        destino: destinoSeleccionado,
        fecha: selectedDate,
        cupo_maximo: Number(cupoMaximo),
        indicaciones,
        guia,
        reservas: [],
        createdAt: serverTimestamp(),
      });

      setSuccess("Excursión creada exitosamente.");

      // Limpiar formulario
      setDestinoId("");
      setFecha("");
      setCupoMaximo(8);
      setIndicaciones("");
      setGuia("");

      // Recargamos la lista
      loadExcursions();
    } catch (err) {
      console.error("Error al crear la excursión", err);
      setError("Error al crear la excursión.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <>
      <Header title="Admin Excursiones" />
      <BackgroundLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Encabezado */}
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ color: "#fff" }}
          >
            Administrador de Excursiones
          </Typography>

          {/* LISTADO DE EXCURSIONES */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
              Listado de Excursiones
            </Typography>

            {errorList && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorList}
              </Alert>
            )}

            {loadingExcursionsList ? (
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress size={24} />
              </Box>
            ) : excursionsList.length === 0 ? (
              <Typography>No hay excursiones creadas todavía.</Typography>
            ) : (
              excursionsList.map((exc) => {
                const reservasCount = exc.reservas?.length || 0;
                return (
                  <Box
                    key={exc.id}
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
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        ID: {exc.id}
                      </Typography>
                      <Typography variant="body2">
                        Destino: {exc.destino?.nombre || "N/D"}
                      </Typography>
                      <Typography variant="body2">
                        Cupo: {exc.cupo_maximo ?? "N/D"}
                      </Typography>
                      <Typography variant="body2">
                        Reservas: {reservasCount}
                      </Typography>
                      {exc.indicaciones && (
                        <Typography variant="body2">
                          Indicaciones: {exc.indicaciones}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Button
                        variant="outlined"
                        color="error"
                        disabled={reservasCount > 0}
                        onClick={() => handleDeleteExcursion(exc)}
                      >
                        Eliminar
                      </Button>
                    </Box>
                  </Box>
                );
              })
            )}
          </Paper>

          {/* BOTÓN PARA MOSTRAR FORMULARIO */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setShowCreationForm(!showCreationForm)}
            >
              {showCreationForm ? "Ocultar Formulario" : "Crear Excursión"}
            </Button>
          </Box>

          {/* FORMULARIO PARA CREAR EXCURSIONES */}
          {showCreationForm && (
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 6 }}>
              <Typography variant="h5" align="center" gutterBottom>
                Crear Nueva Excursión
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <Box
                component="form"
                onSubmit={handleCreateExcursion}
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                {/* Destino */}
                <FormControl fullWidth required>
                  <InputLabel id="destino-label">Destino</InputLabel>
                  {loadingDestinos ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Select
                      labelId="destino-label"
                      value={destinoId}
                      label="Destino"
                      onChange={(e) => setDestinoId(e.target.value)}
                    >
                      {destinos.map((dest) => (
                        <MenuItem key={dest.id} value={dest.id}>
                          {dest.nombre}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </FormControl>

                {/* Fecha */}
                <TextField
                  label="Fecha"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />

                {/* Cupo máximo */}
                <TextField
                  label="Cupo Máximo"
                  type="number"
                  inputProps={{ min: 8 }}
                  value={cupoMaximo}
                  onChange={(e) => setCupoMaximo(e.target.value)}
                  required
                />

                {/* Indicaciones */}
                <TextField
                  label="Indicaciones"
                  multiline
                  rows={3}
                  value={indicaciones}
                  onChange={(e) => setIndicaciones(e.target.value)}
                  required
                />

                {/* Guía */}
                <FormControl fullWidth required>
                  <InputLabel id="guia-label">Guía</InputLabel>
                  {loadingGuias ? (
                    <CircularProgress size={24} />
                  ) : (
                    <Select
                      labelId="guia-label"
                      value={guia}
                      label="Guía"
                      onChange={(e) => setGuia(e.target.value)}
                    >
                      {guias.length === 0 ? (
                        <MenuItem disabled value="">
                          No hay guías disponibles
                        </MenuItem>
                      ) : (
                        guias.map((g) => (
                          <MenuItem key={g.id} value={g.id}>
                            {g.username}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  )}
                </FormControl>

                {/* Botón enviar */}
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
                    "Crear Excursión"
                  )}
                </Button>
              </Box>
            </Paper>
          )}
        </Container>
      </BackgroundLayout>
    </>
  );
};

export default AdminExcursiones;
