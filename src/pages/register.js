// src/pages/register.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  // Función para verificar si el username ya existe
  const isUsernameUnique = async (username) => {
    const q = query(collection(db, "users"), where("username", "==", username));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }

    if (formData.password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }

    // Verificar que el username sea único
    const usernameUnique = await isUsernameUnique(formData.username);
    if (!usernameUnique) {
      return setError("El nombre de usuario ya está registrado");
    }

    try {
      setLoading(true);

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // Guardar datos adicionales en la colección "users"
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        role: "estudiante", // rol por defecto
        avatar: "", // No se solicita avatar en el registro
        createdAt: new Date(),
      });

      router.push("/");
    } catch (err) {
      console.error("Error en registro:", err);
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/avila.png)`,
          backgroundSize: "cover",
        }}
      >
        <Container
          maxWidth="sm"
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            py: 4,
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              p: 4,
              bgcolor: "background.paper",
              borderRadius: 3,
              boxShadow: 6,
              width: "100%",
              maxWidth: 400,
            }}
          >
            <Typography variant="h4" textAlign="center" gutterBottom>
              Crear cuenta
            </Typography>

            {error && (
              <Typography color="error" textAlign="center" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Nombre"
              name="firstName"
              sx={{ mb: 2 }}
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Apellido"
              name="lastName"
              sx={{ mb: 2 }}
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Nombre de usuario"
              name="username"
              sx={{ mb: 2 }}
              value={formData.username}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              type="email"
              name="email"
              sx={{ mb: 2 }}
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              name="password"
              sx={{ mb: 2 }}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Confirmar contraseña"
              type="password"
              name="confirmPassword"
              sx={{ mb: 3 }}
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />

            <Button
              fullWidth
              variant="contained"
              size="large"
              color="success"
              type="submit"
              disabled={loading}
              sx={{ height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : "Crear cuenta"}
            </Button>

            <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
              ¿Ya tienes cuenta?{" "}
              <Button
                variant="text"
                onClick={() => router.push("/login")}
                sx={{ textTransform: "none" }}
              >
                Inicia sesión
              </Button>
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Register;
