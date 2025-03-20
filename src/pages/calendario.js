// src/pages/calendario.js

import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from "@mui/material";

import dayjs from "dayjs";
import {
  LocalizationProvider,
  StaticDatePicker,
  PickersDay,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";

// Firebase
import { db } from "../firebase";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  arrayUnion,
  setDoc,
} from "firebase/firestore";

// Hook/context de autenticación
import { useAuth } from "../context/AuthContext";

// Tema personalizado
const customTheme = createTheme({
  palette: {
    primary: {
      main: "#169505",
    },
    text: {
      primary: "#000",
    },
  },
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
          color: "#000",
        },
      },
    },
  },
});

const CalendarioReservas = () => {
  // Extraemos 'user' de nuestro AuthContext
  const { user } = useAuth();

  // Estados para excursiones
  const [excursions, setExcursions] = useState([]);
  const [loadingExcursions, setLoadingExcursions] = useState(true);

  // Filtro de destino
  const [destinosList, setDestinosList] = useState([]);
  const [selectedDestino, setSelectedDestino] = useState("");

  // Fecha seleccionada
  const [date, setDate] = useState(dayjs());
  // Excursiones mostradas debajo del calendario
  const [selectedExcursions, setSelectedExcursions] = useState([]);

  // Pop-ups
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [detailExcursion, setDetailExcursion] = useState(null);
  const [openReservaDialog, setOpenReservaDialog] = useState(false);

  // ================== Cargar Excursiones ==================
  useEffect(() => {
    const fetchExcursions = async () => {
      try {
        setLoadingExcursions(true);
        const q = query(collection(db, "excursiones"), orderBy("fecha", "asc"));
        const querySnapshot = await getDocs(q);

        const excursionsData = querySnapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          let fechaDayjs = null;
          if (data.fecha && data.fecha.toDate) {
            fechaDayjs = dayjs(data.fecha.toDate());
          }
          return {
            id: docSnap.id,
            ...data,
            fecha: fechaDayjs,
          };
        });

        setExcursions(excursionsData);
        setSelectedExcursions(excursionsData);
      } catch (error) {
        console.error("Error al cargar excursiones:", error);
      } finally {
        setLoadingExcursions(false);
      }
    };

    fetchExcursions();
  }, []);

  // ================== Cargar Destinos ==================
  useEffect(() => {
    const fetchDestinos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "destinos"));
        const destinosData = querySnapshot.docs.map(
          (docSnap) => docSnap.data().nombre
        );
        const uniqueDestinos = [...new Set(destinosData)];
        setDestinosList(uniqueDestinos);
      } catch (error) {
        console.error("Error al cargar destinos:", error);
      }
    };
    fetchDestinos();
  }, []);

  // ================== Filtrar Excursiones ==================
  const filterExcursions = (dateToFilter, destinoToFilter) => {
    // Filtrar por fecha
    const dailyExcursions = excursions.filter((exc) => {
      if (!exc.fecha) return false;
      return dateToFilter.isSame(exc.fecha, "day");
    });

    // Filtrar por destino si aplica
    if (destinoToFilter) {
      return dailyExcursions.filter((exc) => {
        const nombreDestino = exc.destino?.nombre?.toLowerCase() || "";
        return nombreDestino.includes(destinoToFilter.toLowerCase());
      });
    }

    return dailyExcursions;
  };

  // ================== Al cambiar Fecha ==================
  const handleDateChange = (newDate) => {
    setDate(newDate);
    const filtered = filterExcursions(newDate, selectedDestino);
    setSelectedExcursions(filtered);
  };

  // ================== Al cambiar Destino ==================
  const handleDestinoChange = (event) => {
    const destino = event.target.value;
    setSelectedDestino(destino);
    const filtered = filterExcursions(date, destino);
    setSelectedExcursions(filtered);
  };

  // ================== renderDay ==================
  // Si no quieres resaltar nada, simplemente:
  const renderDay = (day, _value, DayComponentProps) => {
    return <PickersDay {...DayComponentProps} />;
  };

  // ================== Abrir Detalles ==================
  const handleOpenDetail = (excursion) => {
    // Verificación adicional: si no hay user, bloqueamos
    if (!user) {
      alert("Debes iniciar sesión para ver detalles o reservar.");
      return;
    }
    setDetailExcursion(excursion);
    setOpenDetailDialog(true);
  };

  // Cerrar Detalles
  const handleCloseDetail = () => {
    setDetailExcursion(null);
    setOpenDetailDialog(false);
  };

  // ================== Abrir Reserva ==================
  const handleOpenReserva = () => {
    setOpenReservaDialog(true);
  };

  // Cerrar Reserva
  const handleCloseReserva = () => {
    setOpenReservaDialog(false);
  };

  // ================== Confirmar Reserva ==================
  const handleConfirmReserva = async () => {
    // Doble verificación: si no hay user, bloqueamos
    if (!user) {
      alert("No hay usuario logeado; no puedes reservar");
      return;
    }

    if (!detailExcursion) return;

    try {
      // 1) Agregar al array 'reservas' en la excursión
      const excursionRef = doc(db, "excursiones", detailExcursion.id);
      await updateDoc(excursionRef, {
        reservas: arrayUnion({
          uid: user.uid,
          nombre: user.displayName || user.email || "Usuario sin nombre",
          fechaReserva: new Date(),
        }),
      });

      // 2) Crear documento en la colección "reservas"
      const nuevaReservaRef = doc(collection(db, "reservas"));
      await setDoc(nuevaReservaRef, {
        userId: user.uid,
        excursionId: detailExcursion.id,
        createdAt: new Date(),
        excursionName: detailExcursion.destino?.nombre || "Sin nombre",
        fechaExcursion: detailExcursion.fecha?.toDate() || null,
      });

      alert("¡Reserva confirmada!");
      setOpenReservaDialog(false);
      setOpenDetailDialog(false);
    } catch (error) {
      console.error("Error al confirmar reserva:", error);
      alert("Ocurrió un error al confirmar la reserva.");
    }
  };

  return (
    <>
      <Header title="Calendario de Reservas" />

      <BackgroundLayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            minHeight: "100vh",
            color: "#fff",
            textAlign: "center",
            py: 4,
          }}
        >
          <Typography variant="h3" sx={{ mb: 2 }}>
            Calendario de Reservas
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
            {/* ---------- Filtro por Destino ---------- */}
            <Paper
              sx={{
                mb: 3,
                p: 2,
                backgroundColor: "white",
                borderRadius: 1,
              }}
            >
              <FormControl fullWidth>
                <InputLabel id="filtro-destino-label">
                  Filtrar Destino
                </InputLabel>
                <Select
                  labelId="filtro-destino-label"
                  value={selectedDestino}
                  label="Filtrar Destino"
                  onChange={handleDestinoChange}
                >
                  <MenuItem value="">Todos los destinos</MenuItem>
                  {destinosList.map((dest) => (
                    <MenuItem key={dest} value={dest}>
                      {dest}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Paper>

            {/* ---------- Calendario ---------- */}
            {loadingExcursions ? (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <CircularProgress color="success" />
              </Box>
            ) : (
              <ThemeProvider theme={customTheme}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <StaticDatePicker
                    displayStaticWrapperAs="desktop"
                    value={date}
                    onChange={handleDateChange}
                    renderDay={renderDay}
                  />
                </LocalizationProvider>
              </ThemeProvider>
            )}

            {/* ---------- Lista de Excursiones filtradas ---------- */}
            <Box sx={{ mt: 4 }}>
              {selectedExcursions.length === 0 ? (
                <Typography sx={{ fontStyle: "italic" }}>
                  No hay excursiones para la fecha seleccionada
                  {selectedDestino && ` en ${selectedDestino}`}
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {selectedExcursions.map((exc) => (
                    <Grid item xs={12} key={exc.id}>
                      <Box
                        sx={{
                          backgroundColor: "white",
                          color: "#333",
                          border: "2px solid #3d4f3d",
                          borderRadius: 2,
                          p: 2,
                          display: "flex",
                          flexDirection: { xs: "column", md: "row" },
                          alignItems: "center",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ flexGrow: 1, textAlign: "left" }}>
                          {/* Nombre del destino */}
                          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            {exc.destino?.nombre || "Sin nombre"}
                          </Typography>

                          {/* Fecha de la excursión */}
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {exc.fecha
                              ? `Fecha: ${exc.fecha.format("DD/MM/YYYY")}`
                              : "Sin fecha"}
                          </Typography>

                          {/* Otros campos */}
                          {exc.indicaciones && (
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              Indicaciones: {exc.indicaciones}
                            </Typography>
                          )}

                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Dificultad: {exc.destino?.dificultad || "N/D"}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Duración: {exc.destino?.duracion || "N/D"}
                          </Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            Cupos disponibles: {exc.cupo_maximo ?? "N/D"}
                          </Typography>
                        </Box>

                        {/* Botón "Reservar"
                            - Deshabilitado si user es null */}
                        <Button
                          variant="contained"
                          color="warning"
                          onClick={() => handleOpenDetail(exc)}
                          disabled={!user}
                        >
                          {user ? "Reservar" : "Inicia sesión para reservar"}
                        </Button>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          </Container>
        </Box>
      </BackgroundLayout>

      {/* ---------- Popup de Detalles ---------- */}
      {detailExcursion && (
        <Dialog
          open={openDetailDialog}
          onClose={handleCloseDetail}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Detalles de la Excursión</DialogTitle>
          <DialogContent dividers>
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
              {detailExcursion.destino?.nombre || "Sin nombre"}
            </Typography>

            {detailExcursion.destino?.foto && (
              <Box sx={{ textAlign: "center", mb: 2 }}>
                <img
                  src={detailExcursion.destino.foto}
                  alt="Foto destino"
                  style={{ width: "100%", maxWidth: "400px" }}
                />
              </Box>
            )}

            <Typography variant="body2">
              Fecha:{" "}
              {detailExcursion.fecha
                ? detailExcursion.fecha.format("DD/MM/YYYY")
                : "Sin fecha"}
            </Typography>

            <Typography variant="body2">
              Cupo máximo: {detailExcursion.cupo_maximo || "N/D"}
            </Typography>

            <Typography variant="body2">
              Dificultad:{" "}
              {detailExcursion.destino?.dificultad || "No especificada"}
            </Typography>
            <Typography variant="body2">
              Duración: {detailExcursion.destino?.duracion || "N/D"}
            </Typography>

            {detailExcursion.destino?.descripcion && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Descripción: {detailExcursion.destino.descripcion}
              </Typography>
            )}

            {detailExcursion.indicaciones && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Indicaciones: {detailExcursion.indicaciones}
              </Typography>
            )}

            {detailExcursion.destino?.link_google_map && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">Ubicación:</Typography>
                <a
                  href={detailExcursion.destino.link_google_map}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#1976d2" }}
                >
                  Ver en Google Maps
                </a>
              </Box>
            )}
          </DialogContent>

          <DialogActions>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCloseDetail}
            >
              Cerrar
            </Button>
            {/* Abre popup de Confirmación de Reserva */}
            <Button
              variant="contained"
              color="success"
              onClick={handleOpenReserva}
            >
              Reservar
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* ---------- Popup de Confirmación de Reserva ---------- */}
      <Dialog
        open={openReservaDialog}
        onClose={handleCloseReserva}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmar Reserva</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" sx={{ mb: 2 }}>
            ¿Estás seguro de que deseas reservar esta excursión?
          </Typography>

          {detailExcursion?.destino?.foto && (
            <Box sx={{ textAlign: "center", mb: 1 }}>
              <img
                src={detailExcursion.destino.foto}
                alt="Foto destino"
                style={{ width: "100%", maxWidth: "300px" }}
              />
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleCloseReserva}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirmReserva}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CalendarioReservas;
