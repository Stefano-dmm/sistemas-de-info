// src/pages/admin-contacto.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useRouter } from "next/router";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const ContactoAdmin = () => {
  // Declaración de hooks al inicio del componente
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, authLoading } = useAuth();
  const router = useRouter();

  // useEffect para redireccionar si el usuario no es admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  // useEffect para cargar los mensajes
  useEffect(() => {
    const fetchMensajes = async () => {
      try {
        setLoading(true);
        const q = query(
          collection(db, "contacto_usuarios"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMensajes(data);
      } catch (err) {
        console.error("Error al cargar mensajes:", err);
        setError("Error al cargar mensajes.");
      } finally {
        setLoading(false);
      }
    };

    fetchMensajes();
  }, []);

  // Condicionales en el renderizado (no afectan la declaración de hooks)
  if (authLoading) {
    return null;
  }

  if (user && user.role !== "admin") {
    return null;
  }

  return (
    <>
      <Header title="Contacto Admin" />
      <BackgroundLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography variant="h4" sx={{ color: "#fff", mb: 1 }}>
              Mensajes de Contacto
            </Typography>
            <Button
              variant="contained"
              color="success"
              onClick={() => {
                // Llamada a la función de recarga de mensajes
                setLoading(true);
                setError("");
                (async () => {
                  try {
                    const q = query(
                      collection(db, "contacto_usuarios"),
                      orderBy("createdAt", "desc")
                    );
                    const querySnapshot = await getDocs(q);
                    const data = querySnapshot.docs.map((doc) => ({
                      id: doc.id,
                      ...doc.data(),
                    }));
                    setMensajes(data);
                  } catch (err) {
                    console.error("Error al cargar mensajes:", err);
                    setError("Error al cargar mensajes.");
                  } finally {
                    setLoading(false);
                  }
                })();
              }}
              sx={{ textTransform: "none" }}
            >
              Actualizar
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress color="success" />
            </Box>
          ) : mensajes.length === 0 ? (
            <Typography sx={{ color: "#fff", textAlign: "center" }}>
              No hay mensajes registrados.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {mensajes.map((mensaje) => (
                <Grid item xs={12} key={mensaje.id}>
                  <Card sx={{ p: 2 }}>
                    <CardContent>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {mensaje.nombre} - {mensaje.email}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {mensaje.mensaje}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        {mensaje.createdAt
                          ? new Date(
                              mensaje.createdAt.seconds * 1000
                            ).toLocaleString()
                          : ""}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={() => router.push("/contacto")}
                        sx={{ textTransform: "none" }}
                      >
                        Ir a Contacto
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </BackgroundLayout>
    </>
  );
};

export default ContactoAdmin;
