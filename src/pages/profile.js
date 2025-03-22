// src/pages/profile.js
import React, { useState, useEffect } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);
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
  setDoc,
} from "firebase/firestore";
import { uploadImage } from "../supabase";

// Estados para perfil
const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Estados de perfil
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState("");
  const [originalUsername, setOriginalUsername] = useState("");

  // Estados para mensajes y guardado
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);

  // Estados para ver posts y recuerdos (ya existentes)
  const [openPostsDialog, setOpenPostsDialog] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [openRecuerdosDialog, setOpenRecuerdosDialog] = useState(false);
  const [userRecuerdos, setUserRecuerdos] = useState([]);

  // Estado para avatar nuevo
  const [newAvatarFile, setNewAvatarFile] = useState(null);

  // NUEVOS: Estados para reservas
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [openReservationsDialog, setOpenReservationsDialog] = useState(false);

  // -------------------- Cargar Perfil --------------------
  useEffect(() => {
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

  // -------------------- Cargar Reservas --------------------
  useEffect(() => {
    const fetchReservations = async () => {
      if (!user) return;
      try {
        setLoadingReservations(true);
        const q = query(
          collection(db, "reservas"),
          where("userId", "==", user.uid)
        );
        const querySnap = await getDocs(q);
        const reservationsData = querySnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        // Para obtener el "guia", se consulta la excursión correspondiente
        const reservationsWithDetails = await Promise.all(
          reservationsData.map(async (res) => {
            try {
              const excursionRef = doc(db, "excursiones", res.excursionId);
              const excursionSnap = await getDoc(excursionRef);
              let guiaDisplay = "No asignado";
              if (excursionSnap.exists()) {
                const excursionData = excursionSnap.data();
                // Si el campo 'guia' existe, lo usamos como id para buscar el usuario
                if (excursionData.guia) {
                  const userRef = doc(db, "users", excursionData.guia);
                  const userSnap = await getDoc(userRef);
                  if (userSnap.exists()) {
                    const userData = userSnap.data();
                    guiaDisplay =
                      userData.username ||
                      userData.displayName ||
                      "No asignado";
                  }
                }
              }
              return { ...res, guia: guiaDisplay };
            } catch (error) {
              console.error("Error al cargar excursión:", error);
              return { ...res, guia: "No asignado" };
            }
          })
        );
        setReservations(reservationsWithDetails);
      } catch (err) {
        console.error("Error al cargar reservas:", err);
      } finally {
        setLoadingReservations(false);
      }
    };

    fetchReservations();
  }, [user]);

  // -------------------- Funciones para abrir diálogos --------------------
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

  const handleOpenReservationsDialog = () => {
    setOpenReservationsDialog(true);
  };

  // -------------------- Cerrar Sesión --------------------
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  // -------------------- Guardar Perfil --------------------
  const handleSaveProfile = async () => {
    setError("");
    setSuccess(false);

    if (!firstName.trim() || !lastName.trim() || !username.trim()) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
      setSaving(true);
      if (username !== originalUsername) {
        // Verificar que el username sea único
        const q = query(
          collection(db, "users"),
          where("username", "==", username)
        );
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.size !== 1) {
          setError("El nombre de usuario ya está en uso.");
          setSaving(false);
          return;
        }
      }

      let updatedAvatar = avatar;
      if (newAvatarFile) {
        updatedAvatar = await uploadImage(
          newAvatarFile,
          "avilamet-perfil",
          "avatars"
        );
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        firstName,
        lastName,
        username,
        avatar: updatedAvatar,
        updatedAt: serverTimestamp(),
      });

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

  // -------------------- Función para seleccionar archivo de avatar --------------------
  const handleAvatarFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewAvatarFile(e.target.files[0]);
    }
  };

  // -------------------- Función para filtrar reservas por fecha (asistidas y pendientes) --------------------
  const getReservationsByStatus = () => {
    const today = dayjs();
    const asistidas = reservations.filter((res) =>
      dayjs(res.fechaExcursion.toDate()).isSameOrBefore(today, "day")
    );
    const pendientes = reservations.filter((res) =>
      dayjs(res.fechaExcursion.toDate()).isAfter(today, "day")
    );
    return { asistidas, pendientes };
  };

  // -------------------- Render de la UI --------------------
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

        {/* Contenido principal */}
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
                {/* Botón para mostrar reservas (excursiones) */}
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpenReservationsDialog}
                >
                  Excursiones: {reservations.length}
                </Button>
                <Button variant="outlined" color="error" onClick={handleLogout}>
                  Cerrar sesión
                </Button>
              </Box>
            </Box>
          </Paper>
        </Box>
      </BackgroundLayout>

      {/* Dialog para ver Posts */}
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
                    onClick={() => router.push("/foro")}
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
                        <Typography variant="h6">{post.username}</Typography>
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
                      <Typography variant="body2">
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

      {/* Dialog para ver Recuerdos */}
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
                    onClick={() => router.push("/galeria")}
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
                        <Typography variant="h6">{rec.username}</Typography>
                      }
                    />
                    <CardMedia
                      component="img"
                      image={rec.imagen}
                      alt="Imagen Recuerdo"
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

      {/* Dialog para ver Reservas */}
      <Dialog
        open={openReservationsDialog}
        onClose={() => setOpenReservationsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Mis Excursiones
          <IconButton
            onClick={() => setOpenReservationsDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingReservations ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : reservations.length === 0 ? (
            <Typography variant="body2" sx={{ fontStyle: "italic" }}>
              No tienes reservas.
            </Typography>
          ) : (
            <>
              <Typography variant="subtitle1">
                Excursiones Asistidas:
              </Typography>
              {reservations.filter((res) =>
                dayjs(res.fechaExcursion.toDate()).isSameOrBefore(
                  dayjs(),
                  "day"
                )
              ).length === 0 ? (
                <Typography>No tienes excursiones asistidas.</Typography>
              ) : (
                reservations
                  .filter((res) =>
                    dayjs(res.fechaExcursion.toDate()).isSameOrBefore(
                      dayjs(),
                      "day"
                    )
                  )
                  .map((res) => (
                    <Box
                      key={res.id}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography>{res.excursionName}</Typography>
                      <Typography>
                        {dayjs(res.fechaExcursion.toDate()).format(
                          "DD/MM/YYYY"
                        )}
                      </Typography>
                      <Typography>{res.guia}</Typography>
                    </Box>
                  ))
              )}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">
                  Excursiones Pendientes:
                </Typography>
                {reservations.filter((res) =>
                  dayjs(res.fechaExcursion.toDate()).isAfter(dayjs(), "day")
                ).length === 0 ? (
                  <Typography>No tienes excursiones pendientes.</Typography>
                ) : (
                  reservations
                    .filter((res) =>
                      dayjs(res.fechaExcursion.toDate()).isAfter(dayjs(), "day")
                    )
                    .map((res) => (
                      <Box
                        key={res.id}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          mb: 1,
                        }}
                      >
                        <Typography>{res.excursionName}</Typography>
                        <Typography>
                          {dayjs(res.fechaExcursion.toDate()).format(
                            "DD/MM/YYYY"
                          )}
                        </Typography>
                        <Typography>{res.guia}</Typography>
                      </Box>
                    ))
                )}
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setOpenReservationsDialog(false);
              router.push("/donativos");
            }}
          >
            Ir a Donaciones
          </Button>
        </DialogActions>
      </Dialog>
    </ProtectedRoute>
  );
};

export default Profile;
