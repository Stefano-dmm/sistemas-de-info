// src/pages/profile.js
import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import {
  Box,
  Typography,
  Button,
  Avatar,
  TextField,
  CardActions,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  CardMedia,
  CardHeader,
  Grid,
  IconButton,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { useRouter } from "next/router";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { uploadImage } from "../supabase"; // Ajusta la ruta según tu estructura

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Estados para mostrar/cargar la info de perfil
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("");

  // Guardar el username original para detectar cambios
  const [originalUsername, setOriginalUsername] = useState("");

  // Estados para mostrar mensajes de error/éxito
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para ver posts
  const [openPostsDialog, setOpenPostsDialog] = useState(false);
  const [userPosts, setUserPosts] = useState([]);

  // Estados para ver recuerdos (galería)
  const [openRecuerdosDialog, setOpenRecuerdosDialog] = useState(false);
  const [userRecuerdos, setUserRecuerdos] = useState([]);

  // Estado para la selección de un nuevo avatar (archivo)
  const [newAvatarFile, setNewAvatarFile] = useState(null);

  useEffect(() => {
    // Cargar datos de la colección "users" si hay usuario logeado
    const loadUserProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setUsername(data.username || "");
          setEmail(data.email || "");
          setRole(data.role || "");
          setAvatar(data.avatar || "");
          setOriginalUsername(data.username || "");
        }
      } catch (err) {
        console.error("Error al cargar perfil:", err);
        setError("Error al cargar el perfil.");
      } finally {
        setLoadingProfile(false);
      }
    };
    loadUserProfile();
  }, [user]);

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // Verificar si un username es único
  const isUsernameUnique = async (newUsername) => {
    const q = query(
      collection(db, "users"),
      where("username", "==", newUsername)
    );
    const querySnap = await getDocs(q);
    if (querySnap.empty) return true;
    if (querySnap.size === 1) {
      const docFound = querySnap.docs[0];
      return docFound.id === user.uid;
    }
    return false;
  };

  // Manejador para seleccionar un nuevo archivo de avatar
  const handleAvatarFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatarFile(e.target.files[0]);
    }
  };

  // Guardar cambios en el perfil
  const handleSaveProfile = async () => {
    setError("");
    setSuccess(false);

    // Validar campos
    if (!firstName.trim() || !lastName.trim() || !username.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    setSaving(true);
    try {
      // Verificar unicidad de username si cambió
      if (username !== originalUsername) {
        const unique = await isUsernameUnique(username);
        if (!unique) {
          setError("El nombre de usuario ya está en uso.");
          setSaving(false);
          return;
        }
      }

      let updatedAvatar = avatar;
      // Si el usuario seleccionó un nuevo archivo, subirlo a Supabase
      if (newAvatarFile) {
        updatedAvatar = await uploadImage(
          newAvatarFile,
          "avilamet-perfil",
          "avatars"
        );
      }

      // Actualizar en Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        firstName,
        lastName,
        username,
        avatar: updatedAvatar,
        updatedAt: serverTimestamp(),
      });

      // Actualizar estado local
      setAvatar(updatedAvatar);
      setSuccess(true);
      setOriginalUsername(username);
      setNewAvatarFile(null);
    } catch (err) {
      console.error("Error al guardar perfil:", err);
      setError("Error al guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  // Abrir el diálogo para ver posts del usuario
  const handleOpenPosts = async () => {
    try {
      const q = query(collection(db, "posts"), where("uid", "==", user.uid));
      const querySnap = await getDocs(q);
      const posts = querySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserPosts(posts);
      setOpenPostsDialog(true);
    } catch (err) {
      console.error("Error al cargar posts del usuario:", err);
    }
  };

  // Abrir el diálogo para ver recuerdos (galería) del usuario
  const handleOpenRecuerdos = async () => {
    try {
      const q = query(
        collection(db, "galeria_fotos"),
        where("postedBy", "==", user.uid)
      );
      const querySnap = await getDocs(q);
      const recuerdos = querySnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserRecuerdos(recuerdos);
      setOpenRecuerdosDialog(true);
    } catch (err) {
      console.error("Error al cargar recuerdos del usuario:", err);
    }
  };

  if (loadingProfile) {
    return (
      <ProtectedRoute>
        <Header />
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Header />
      <BackgroundLayout>
        {/* Banner */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            textAlign: "center",
            pt: 4,
          }}
        >
          <Typography variant="h3" sx={{ mb: 2 }}>
            Configuración del Perfil
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: "20px",
              backgroundColor: "#169505",
              mb: 3,
            }}
          />
        </Box>

        {/* Contenido principal en cuadro blanco centrado */}
        <Box
          sx={{
            minHeight: "60vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pb: 4,
            px: { xs: 2, md: 4 },
          }}
        >
          <Paper
            sx={{
              width: "100%",
              maxWidth: "900px",
              p: 4,
              borderRadius: 3,
              boxShadow: 3,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 4,
            }}
          >
            {/* Sección izquierda: Avatar y Rol */}
            <Box
              sx={{
                flex: "0 0 250px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Avatar
                src={avatar || undefined}
                alt="Avatar"
                sx={{ width: 120, height: 120, bgcolor: "#169505", mb: 2 }}
              >
                {!avatar && username ? username.charAt(0).toUpperCase() : null}
              </Avatar>
              {/* Rol en cuadro verde */}
              <Box
                sx={{
                  backgroundColor:
                    role === "guia"
                      ? "#c7a800"
                      : role === "admin"
                      ? "#e60000"
                      : "#169505",
                  color: "#fff",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <Typography variant="body1">{role || "estudiante"}</Typography>
              </Box>
              <Button variant="contained" component="label" color="primary">
                Cambiar Avatar
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleAvatarFileChange}
                />
              </Button>
              {newAvatarFile && (
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  {newAvatarFile.name}
                </Typography>
              )}
            </Box>

            {/* Sección derecha: Información y opciones */}
            <Box
              sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}
            >
              {error && (
                <Alert severity="error" onClose={() => setError("")}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" onClose={() => setSuccess(false)}>
                  Perfil actualizado con éxito.
                </Alert>
              )}

              <TextField
                label="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                fullWidth
              />
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
              />
              <TextField
                label="Correo electrónico"
                value={email}
                disabled
                fullWidth
                sx={{ cursor: "not-allowed" }}
              />

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Guardar Cambios"
                  )}
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleOpenRecuerdos}
                >
                  Ver recuerdos
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleOpenPosts}
                >
                  Ver posts
                </Button>
                <Button variant="outlined" color="error" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </BackgroundLayout>

      {/* Dialog para mostrar los posts del usuario */}
      <Dialog
        open={openPostsDialog}
        onClose={() => setOpenPostsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Tus Posts
          <IconButton
            onClick={() => setOpenPostsDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {userPosts.length === 0 ? (
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              Aún no has publicado ningún post.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {userPosts.map((post) => (
                <Grid item xs={12} md={6} key={post.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255,255,255,0.9)",
                      "&:hover": {
                        transform: "scale(1.02)",
                        transition: "transform 0.3s ease",
                      },
                    }}
                    onClick={() => router.push("/foro")} // O "/foro/[id]" si deseas un post específico
                  >
                    <CardHeader
                      avatar={
                        <Avatar
                          alt={post.username || "Usuario"}
                          src={post.userAvatar || undefined}
                          sx={{ bgcolor: "#169505" }}
                        >
                          {!post.userAvatar && post.username
                            ? post.username.charAt(0).toUpperCase()
                            : null}
                        </Avatar>
                      }
                      title={
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {post.username}
                        </Typography>
                      }
                    />
                    {post.postImage && (
                      <CardMedia
                        component="img"
                        image={post.postImage}
                        alt="Imagen Post"
                        sx={{ height: 200, objectFit: "cover" }}
                      />
                    )}
                    <CardContent>
                      <Typography variant="body1">{post.content}</Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: "flex-end" }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Respuestas: {post.replies ?? 0}
                      </Typography>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para mostrar los recuerdos (fotos en la galería) del usuario */}
      <Dialog
        open={openRecuerdosDialog}
        onClose={() => setOpenRecuerdosDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Tus Recuerdos
          <IconButton
            onClick={() => setOpenRecuerdosDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {userRecuerdos.length === 0 ? (
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              Aún no has subido recuerdos a la galería.
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {userRecuerdos.map((rec) => (
                <Grid item xs={12} md={6} key={rec.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      borderRadius: "8px",
                      backgroundColor: "rgba(255,255,255,0.9)",
                      "&:hover": {
                        transform: "scale(1.02)",
                        transition: "transform 0.3s ease",
                      },
                    }}
                    onClick={() => router.push("/galeria")} // O "/galeria/[id]" si deseas un recuerdo específico
                  >
                    <CardHeader
                      avatar={
                        <Avatar
                          alt={rec.username}
                          src={rec.userAvatar || undefined}
                          sx={{ bgcolor: "#169505" }}
                        >
                          {!rec.userAvatar && rec.username
                            ? rec.username.charAt(0).toUpperCase()
                            : null}
                        </Avatar>
                      }
                      title={
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {rec.username}
                        </Typography>
                      }
                    />
                    <CardMedia
                      component="img"
                      image={rec.imagen}
                      alt={rec.nombre}
                      sx={{ height: 200, objectFit: "cover" }}
                    />
                    <CardContent>
                      <Typography variant="h6">{rec.nombre}</Typography>
                      <Typography variant="body2">{rec.descripcion}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
};

export default Profile;
