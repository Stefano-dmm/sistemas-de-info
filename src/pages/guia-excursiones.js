import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";

export default function GuiaExcursiones() {
  // 1) DECLARA TODOS TUS HOOKS AL INICIO, SIN IF
  const router = useRouter();
  const { user, authLoading } = useAuth();

  // Estados para el formulario
  const [destinoId, setDestinoId] = useState("");
  const [fecha, setFecha] = useState("");
  const [cupoMaximo, setCupoMaximo] = useState(8);
  const [indicaciones, setIndicaciones] = useState("");
  const [guia, setGuia] = useState("");

  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Estados para cargar destinos y guías
  const [destinos, setDestinos] = useState([]);
  const [guias, setGuias] = useState([]);
  const [loadingDestinos, setLoadingDestinos] = useState(true);
  const [loadingGuias, setLoadingGuias] = useState(true);

  // 2) HAZ LOS useEffect QUE NECESITES
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

  // 4) FUNCIONES
  const handleCreateExcursion = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validar
    if (!destinoId || !fecha || !cupoMaximo || !indicaciones || !guia) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    if (Number(cupoMaximo) < 8) {
      setError("El cupo máximo debe ser de al menos 8 personas.");
      return;
    }

    const destinoSeleccionado = destinos.find((d) => d.id === destinoId);
    if (!destinoSeleccionado) {
      setError("Destino no encontrado.");
      return;
    }

    setLoadingSubmit(true);
    try {
      const selectedDate = new Date(fecha);
      selectedDate.setHours(0, 0, 0, 0);

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
      // Limpieza
      setDestinoId("");
      setFecha("");
      setCupoMaximo(8);
      setIndicaciones("");
      setGuia("");
    } catch (err) {
      console.error("Error al crear la excursión", err);
      setError("Error al crear la excursión.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // 5) RENDER UI FINAL
  return (
    <>
      <Header title="Guía: Crear Excursión" />
      <BackgroundLayout>
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Box sx={{ p: 4, bgcolor: "white", borderRadius: 3, boxShadow: 6 }}>
            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 3, color: "#000" }}
            >
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

              {/* Botón para crear */}
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
          </Box>
        </Container>
      </BackgroundLayout>
    </>
  );
}
