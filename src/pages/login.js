// src/pages/login.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Avatar,
} from "@mui/material";
import { useRouter } from "next/router";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../firebase";
import Header from "../components/Header";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, redirige a la home
  useEffect(() => {
    if (user) router.push("/");
  }, [user]);

  // Función auxiliar para obtener el username
  const getDisplayUsername = (user) => {
    if (user.displayName && user.displayName.trim() !== "")
      return user.displayName;
    if (user.email) return user.email.split("@")[0];
    return "Usuario";
  };

  // Manejo del login con correo y contraseña
  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/");
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setError(
        err.code === "auth/invalid-credential"
          ? "Credenciales incorrectas"
          : "Error al iniciar sesión"
      );
    } finally {
      setLoading(false);
    }
  };

  // Manejo del login con Google y rellenado de la colección "users"
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        // Crear usuario en Firestore con datos de Google
        await setDoc(userRef, {
          uid: currentUser.uid,
          firstName: currentUser.displayName
            ? currentUser.displayName.split(" ")[0]
            : "",
          lastName: currentUser.displayName
            ? currentUser.displayName.split(" ").slice(1).join(" ")
            : "",
          username: currentUser.displayName
            ? currentUser.displayName
            : currentUser.email.split("@")[0],
          email: currentUser.email,
          role: "estudiante", // Rol por defecto
          avatar: currentUser.photoURL || "",
          createdAt: serverTimestamp(),
        });
      }
      router.push("/");
    } catch (error) {
      console.error("Error con Google:", error);
      setError("Error al autenticar con Google");
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
          backgroundPosition: "center",
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
              Bienvenido a AvilaMET
            </Typography>

            {error && (
              <Typography color="error" textAlign="center" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Correo electrónico"
              variant="outlined"
              sx={{ mb: 2 }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type="password"
              sx={{ mb: 3 }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              fullWidth
              variant="contained"
              color="success"
              size="large"
              onClick={handleLogin}
              disabled={loading}
              sx={{ mb: 2, height: 48 }}
            >
              {loading ? <CircularProgress size={24} /> : "Iniciar sesión"}
            </Button>

            <Typography variant="body2" textAlign="center" sx={{ mb: 3 }}>
              ──── o continúa con ────
            </Typography>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={handleGoogleLogin}
                disabled={loading}
                sx={{
                  minWidth: 48,
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  bgcolor: "green",
                  "&:hover": { bgcolor: "grey.100" },
                }}
              >
                <Avatar src="/google.png" sx={{ width: 28, height: 28 }} />
              </Button>
            </Stack>

            <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
              ¿No tienes cuenta?{" "}
              <Button
                variant="text"
                onClick={() => router.push("/register")}
                sx={{ textTransform: "none" }}
              >
                Regístrate aquí
              </Button>
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Login;
