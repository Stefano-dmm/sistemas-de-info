// src/pages/admin-moderacion.js
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
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase";

// Componente auxiliar para los paneles de Tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminModeracion = () => {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  // Estados para posts del foro
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState("");

  // Estados para imágenes de la galería
  const [gallery, setGallery] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [errorGallery, setErrorGallery] = useState("");

  const [updateMessage, setUpdateMessage] = useState("");

  // Estado para Tabs: 0 = Foro, 1 = Galería
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Estados para el diálogo de confirmación
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogMessage, setConfirmDialogMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(() => {});

  // --- DEFINICIÓN DE FUNCIONES ---
  // Función para cargar posts del foro marcados como inapropiados
  const fetchInappropriatePosts = async () => {
    try {
      setLoadingPosts(true);
      const q = query(
        collection(db, "posts"),
        where("isInappropriate", "==", true),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setPosts(data);
    } catch (err) {
      console.error("Error al cargar posts inapropiados:", err);
      setErrorPosts("Error al cargar posts inapropiados.");
    } finally {
      setLoadingPosts(false);
    }
  };
  const fetchInappropriateGallery = async () => {
    try {
      setLoadingGallery(true);
      const q = query(
        collection(db, "galeria_fotos"),
        where("isInappropriate", "==", true),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setGallery(data);
    } catch (err) {
      console.error("Error al cargar imágenes inapropiadas:", err);
      setErrorGallery("Error al cargar imágenes inapropiadas.");
    } finally {
      setLoadingGallery(false);
    }
  };

  // Uso de los useEffect para cargar los datos
  useEffect(() => {
    fetchInappropriatePosts();
    fetchInappropriateGallery();
  }, []);

  // Estados para verificación de rol (similar a admin-roles)
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  if (authLoading) return null;
  if (user && user.role !== "admin") return null;

  const showConfirmDialog = (message, actionCallback) => {
    setConfirmDialogMessage(message);
    setConfirmAction(() => actionCallback);
    setConfirmDialogOpen(true);
  };

  const handleConfirm = () => {
    confirmAction();
    setConfirmDialogOpen(false);
  };

  const handleCancelConfirm = () => {
    setConfirmDialogOpen(false);
  };

  // Función para cargar imágenes de la galería marcadas como inapropiadas

  // Funciones de confirmación para posts del foro
  const confirmReestablecerPost = (postId) => {
    showConfirmDialog("¿Estás seguro de reestablecer este post?", async () => {
      try {
        await updateDoc(doc(db, "posts", postId), { isInappropriate: false });
        setUpdateMessage("Post reestablecido exitosamente.");
        fetchInappropriatePosts();
      } catch (err) {
        console.error("Error al reestablecer post:", err);
        setErrorPosts("Error al reestablecer post.");
      }
    });
  };

  const confirmEliminarPost = (postId) => {
    showConfirmDialog("¿Estás seguro de eliminar este post?", async () => {
      try {
        await deleteDoc(doc(db, "posts", postId));
        setUpdateMessage("Post eliminado exitosamente.");
        fetchInappropriatePosts();
      } catch (err) {
        console.error("Error al eliminar post:", err);
        setErrorPosts("Error al eliminar post.");
      }
    });
  };

  // Funciones de confirmación para la galería
  const confirmReestablecerGallery = (imageId) => {
    showConfirmDialog(
      "¿Estás seguro de reestablecer esta imagen?",
      async () => {
        try {
          await updateDoc(doc(db, "galeria_fotos", imageId), {
            isInappropriate: false,
          });
          setUpdateMessage("Imagen reestablecida exitosamente.");
          fetchInappropriateGallery();
        } catch (err) {
          console.error("Error al reestablecer imagen:", err);
          setErrorGallery("Error al reestablecer imagen.");
        }
      }
    );
  };

  const confirmEliminarGallery = (imageId) => {
    showConfirmDialog("¿Estás seguro de eliminar esta imagen?", async () => {
      try {
        await deleteDoc(doc(db, "galeria_fotos", imageId));
        setUpdateMessage("Imagen eliminada exitosamente.");
        fetchInappropriateGallery();
      } catch (err) {
        console.error("Error al eliminar imagen:", err);
        setErrorGallery("Error al eliminar imagen.");
      }
    });
  };

  return (
    <>
      <Header title="Admin Moderación" />
      <BackgroundLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography variant="h4" align="center" sx={{ mb: 3, color: "#fff" }}>
            Moderación de Contenido
          </Typography>
          <Box
            sx={{
              backgroundColor: "#2e7d32", // Fondo verde oscuro
              color: "#fff", // Texto blanco en general
              p: 4,
              borderRadius: 2,
              boxShadow: 3,
            }}
          >
            {updateMessage && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {updateMessage}
              </Alert>
            )}

            {/* Tabs con indicador blanco */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              centered
              textColor="inherit"
              TabIndicatorProps={{
                style: { backgroundColor: "#fff" },
              }}
            >
              <Tab label="Posts Inapropiados" />
              <Tab label="Imágenes Inapropiadas" />
            </Tabs>

            {/* Panel: Posts Inapropiados */}
            <TabPanel value={tabValue} index={0}>
              <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
                Posts Inapropiados
              </Typography>
              {errorPosts && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorPosts}
                </Alert>
              )}
              {loadingPosts ? (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <CircularProgress color="inherit" />
                </Box>
              ) : posts.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: "center", mb: 4 }}>
                  No hay posts marcados como inapropiados.
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {posts.map((post) => (
                    <Grid item xs={12} key={post.id}>
                      {/* Tarjeta con fondo blanco y texto oscuro */}
                      <Card
                        sx={{
                          p: 2,
                          backgroundColor: "#fff",
                          color: "text.primary",
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6">{post.username}</Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {post.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {post.createdAt
                              ? new Date(
                                  post.createdAt.seconds * 1000
                                ).toLocaleString()
                              : ""}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => confirmReestablecerPost(post.id)}
                            sx={{ textTransform: "none" }}
                          >
                            Reestablecer
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => confirmEliminarPost(post.id)}
                            sx={{ textTransform: "none", ml: 2 }}
                          >
                            Eliminar
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>

            {/* Panel: Imágenes Inapropiadas */}
            <TabPanel value={tabValue} index={1}>
              <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
                Imágenes de Galería Inapropiadas
              </Typography>
              {errorGallery && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {errorGallery}
                </Alert>
              )}
              {loadingGallery ? (
                <Box sx={{ textAlign: "center", py: 2 }}>
                  <CircularProgress color="inherit" />
                </Box>
              ) : gallery.length === 0 ? (
                <Typography variant="body1" sx={{ textAlign: "center" }}>
                  No hay imágenes marcadas como inapropiadas.
                </Typography>
              ) : (
                <Grid container spacing={3}>
                  {gallery.map((image) => (
                    <Grid item xs={12} key={image.id}>
                      {/* Tarjeta con fondo blanco y texto oscuro */}
                      <Card
                        sx={{
                          p: 2,
                          backgroundColor: "#fff",
                          color: "text.primary",
                        }}
                      >
                        <CardContent>
                          <Typography variant="h6">{image.username}</Typography>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {image.nombre}
                          </Typography>
                          <Box
                            component="img"
                            src={image.imagen}
                            alt={image.nombre}
                            sx={{
                              width: "100%",
                              maxHeight: 200,
                              objectFit: "cover",
                              mb: 1,
                            }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {image.createdAt
                              ? new Date(
                                  image.createdAt.seconds * 1000
                                ).toLocaleString()
                              : ""}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            variant="contained"
                            color="success"
                            onClick={() => confirmReestablecerGallery(image.id)}
                            sx={{ textTransform: "none" }}
                          >
                            Reestablecer
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => confirmEliminarGallery(image.id)}
                            sx={{ textTransform: "none", ml: 2 }}
                          >
                            Eliminar
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </TabPanel>
          </Box>
        </Container>
      </BackgroundLayout>

      {/* Diálogo de Confirmación */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelConfirm}>
        <DialogTitle>Confirmación</DialogTitle>
        <DialogContent>
          <Typography>{confirmDialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelConfirm} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} color="primary">
            Aceptar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminModeracion;
