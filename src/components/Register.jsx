import React, { useState } from "react";
import HeaderLogin from "./HeaderLogin";
import { Box, Container, Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import backgroundImage from "../assets/avila.png";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones de contraseñas
    if (password !== confirmPassword) {
      return setError("Las contraseñas no coinciden");
    }

    if (password.length < 6) {
      return setError("La contraseña debe tener al menos 6 caracteres");
    }

    try {
      setLoading(true);

      // Verificar si el username ya existe
      const usernameRef = doc(db, "usernames", username);
      const usernameSnap = await getDoc(usernameRef);

      if (usernameSnap.exists()) {
        throw new Error("El nombre de usuario ya está en uso");
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Guardar datos adicionales en Firestore
      const userRef = doc(db, "users", userCredential.user.uid);
      await Promise.all([
        setDoc(userRef, {
          uid: userCredential.user.uid,
          firstName,
          lastName,
          username,
          email,
          createdAt: new Date(),
        }),
        setDoc(usernameRef, {
          // Registrar el username para evitar duplicados
          uid: userCredential.user.uid,
        }),
      ]);

      navigate("/"); // Redirigir al home después de registro exitoso
    } catch (error) {
      console.error("Error en registro:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <HeaderLogin /> {/* Añadir HeaderLogin arriba */}
      <Box sx={{ position: "relative", minHeight: "100vh", width: "100vw" }}>
        {/* Fondo con overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
          }}
        />
        {/* Contenedor centrado para el formulario */}
        <Container
          maxWidth="sm"
          sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <Box
            sx={{
              p: 4,
              backgroundColor: "rgba(255,255,255,0.9)",
              borderRadius: 2,
              boxShadow: 3,
              textAlign: "center",
              width: "100%",
              maxWidth: "400px",
            }}
          >
            <Typography variant="h4" gutterBottom>
              Crea tu cuenta
            </Typography>

            {/* Mostrar error si existe */}
            {error && (
              <Typography variant="body1" color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            {/* Formulario */}
            <form onSubmit={handleRegister}>
              <TextField
                label="Nombre"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextField
                label="Apellido"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <TextField
                label="Usuario"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextField
                label="Correo electrónico"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Contraseña"
                type="password"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <TextField
                label="Confirmar contraseña"
                type="password"
                variant="outlined"
                fullWidth
                sx={{ mb: 2 }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={loading}
                fullWidth
                sx={{ mb: 2 }}
              >
                {loading ? "Registrando..." : "Registrarse"}
              </Button>
            </form>

            <Typography variant="body2">
              ¿Ya tienes cuenta?{" "}
              <Button variant="text" onClick={() => navigate("/login")}>
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
