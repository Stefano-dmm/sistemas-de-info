import React, { useState } from "react";
import HeaderLogin from "./HeaderLogin";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Usuario logueado:", userCredential.user);
      navigate("/");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError("Correo o contraseña incorrectos.");
    }
  };

  const handleGoogleLogin = () => {};

  const handleFacebookLogin = () => {};

  const goToRegister = () => {
    navigate("/register");
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
            Bienvenido
          </Typography>
          <Typography variant="h6" gutterBottom>
            Inicia sesión y comienza a explorar
          </Typography>

          {error && (
            <Typography variant="body1" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <TextField
            label="Dirección de correo electrónico"
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

          <Button
            variant="contained"
            color="success"
            onClick={handleLogin}
            fullWidth
            sx={{ mb: 2 }}
          >
            Iniciar sesión
          </Button>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mb: 2 }}
          >
            <Button
              variant="contained"
              color="primary"
              onClick={handleGoogleLogin}
            >
              Google
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleFacebookLogin}
            >
              Facebook
            </Button>
          </Stack>

          <Typography variant="body2">
            ¿No tienes cuenta?
            <Button variant="text" onClick={goToRegister}>
              Regístrate
            </Button>
          </Typography>
        </Box>
      </Container>
    </div>
  );
};

export default Login;
