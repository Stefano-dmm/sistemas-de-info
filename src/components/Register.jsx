import React, { useState } from "react";
import HeaderLogin from "./HeaderLogin";
import { Container, Box, Typography, TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Register = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Usuario registrado:", userCredential.user);
      navigate("/login");
    } catch (err) {
      console.error("Error al registrar:", err);
      setError("No se pudo registrar el usuario. Verifica tu correo.");
    }
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          'url("https://via.placeholder.com/1920x1080") no-repeat center center',
        backgroundSize: "cover",
      }}
    >
      <HeaderLogin />
      <Container maxWidth="sm" sx={{ mt: 5 }}>
        <Box
          sx={{
            p: 4,
            backgroundColor: "rgba(255,255,255,0.9)",
            borderRadius: 2,
            boxShadow: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" gutterBottom>
            Crea tu cuenta
          </Typography>

          {error && (
            <Typography variant="body1" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

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
            variant="contained"
            color="success"
            onClick={handleRegister}
            fullWidth
            sx={{ mb: 2 }}
          >
            Registrarse
          </Button>

          <Typography variant="body2">
            ¿Ya tienes cuenta?
            <Button variant="text" onClick={goToLogin}>
              Inicia sesión
            </Button>
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default Register;
