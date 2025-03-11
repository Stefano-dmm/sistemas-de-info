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
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import backgroundImage from "../assets/avila.png";
import googleLogo from "../assets/gmlogoblanco.png";
import facebookLogo from "../assets/fblogoblanco.png";

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

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log("Usuario logueado con Google:", user);
      navigate("/");
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
      setError("Hubo un error al intentar iniciar sesión con Google.");
    }
  };

  const handleFacebookLogin = () => {};

  return (
    <>
      <HeaderLogin />
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
              Bienvenido
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
                color="success"
                onClick={handleGoogleLogin}
                sx={{
                  width: "50px",
                  height: "50px",
                  minWidth: "unset",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={googleLogo}
                  alt="Google"
                  style={{ width: "35px", height: "35px" }}
                />
              </Button>

              <Button
                variant="contained"
                color="success"
                onClick={handleFacebookLogin}
                sx={{
                  width: "50px",
                  height: "50px",
                  minWidth: "unset",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src={facebookLogo}
                  alt="Facebook"
                  style={{ width: "43px", height: "43px" }}
                />
              </Button>
            </Stack>

            <Typography variant="body2">
              ¿No tienes cuenta?{" "}
              <Button variant="text" onClick={() => navigate("/register")}>
                Regístrate
              </Button>
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Login;
