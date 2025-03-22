// src/pages/foro.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  IconButton,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Skeleton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";

// Componente de buscador unificado con selector de criterio
const UnifiedSearchBar = ({
  searchCriterion,
  onCriterionChange,
  searchTerm,
  onSearchTermChange,
}) => {
  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel id="search-criterion-label">Buscar por</InputLabel>
        <Select
          labelId="search-criterion-label"
          value={searchCriterion}
          label="Buscar por"
          onChange={(e) => onCriterionChange(e.target.value)}
        >
          <MenuItem value="usuario">Usuario</MenuItem>
          <MenuItem value="contenido">Contenido</MenuItem>
        </Select>
      </FormControl>
      <TextField
        label="Buscar"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        fullWidth
      />
    </Box>
  );
};

// Función auxiliar para obtener un username basado en el user de Firebase
const getUsername = (user) => {
  if (user.displayName) return user.displayName;
  if (user.email) return user.email.split("@")[0];
  return "Usuario";
};

/**
 * Obtiene todos los posts de la colección "posts", ordenados por fecha descendente.
 * Ahora se consulta solo los posts que no están marcados como inapropiados.
 */
async function fetchPosts() {
  const q = query(
    collection(db, "posts"),
    where("isInappropriate", "==", false),
    orderBy("createdAt", "desc")
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

/**
 * Obtiene todas las respuestas de la subcolección "responses" de un post.
 */
async function fetchResponses(postId) {
  const responsesRef = collection(db, "posts", postId, "responses");
  const querySnapshot = await getDocs(responsesRef);
  return querySnapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

const Foro = () => {
  const [forumPosts, setForumPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  // Estados para el buscador unificado
  const [searchCriterion, setSearchCriterion] = useState("usuario");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);

  // Estados para el post seleccionado en el diálogo
  const [selectedPost, setSelectedPost] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Estados para las respuestas en el diálogo
  const [responses, setResponses] = useState([]);
  const [newResponse, setNewResponse] = useState("");
  const [responseLoading, setResponseLoading] = useState(false);

  // Estados para crear un nuevo post (Iniciar Conversación)
  const [openCreate, setOpenCreate] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const { user } = useAuth();
  const router = useRouter();

  // Cargar posts al montar el componente
  useEffect(() => {
    const loadPosts = async () => {
      setLoadingPosts(true);
      try {
        const postsData = await fetchPosts();
        setForumPosts(postsData);
      } catch (error) {
        console.error("Error al cargar los posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };
    loadPosts();
  }, []);

  // Filtrar posts según el criterio y término de búsqueda
  useEffect(() => {
    const filtered = forumPosts.filter((post) => {
      if (searchTerm.trim() === "") return true;
      if (searchCriterion === "usuario") {
        return post.username.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchCriterion === "contenido") {
        return post.content.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
    setFilteredPosts(filtered);
  }, [forumPosts, searchCriterion, searchTerm]);

  // Abrir diálogo para ver/contestar un post y cargar sus respuestas
  const handleOpenDialog = async (post) => {
    setSelectedPost(post);
    setOpenDialog(true);
    setResponses([]);
    setNewResponse("");
    try {
      const fetchedResponses = await fetchResponses(post.id);
      setResponses(fetchedResponses);
    } catch (error) {
      console.error("Error al obtener respuestas:", error);
    }
  };

  const handleCloseDialog = () => {
    setSelectedPost(null);
    setOpenDialog(false);
    setResponses([]);
    setNewResponse("");
  };

  // Agregar respuesta y actualizar el post
  const handleAddResponse = async () => {
    if (!user) return;
    if (!newResponse.trim()) return;
    setResponseLoading(true);
    try {
      await addDoc(collection(db, "posts", selectedPost.id, "responses"), {
        username: getUsername(user),
        content: newResponse.trim(),
        createdAt: serverTimestamp(),
      });
      const fetchedResponses = await fetchResponses(selectedPost.id);
      setResponses(fetchedResponses);
      const totalResponses = fetchedResponses.length;
      await updateDoc(doc(db, "posts", selectedPost.id), {
        replies: totalResponses,
      });
      const updatedPosts = await fetchPosts();
      setForumPosts(updatedPosts);
      setNewResponse("");
    } catch (error) {
      console.error("Error al agregar respuesta:", error);
    } finally {
      setResponseLoading(false);
    }
  };

  // Abrir diálogo para crear nuevo post
  const handleOpenCreate = () => {
    setNewContent("");
    setCreateError("");
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
  };

  // Crear nuevo post, agregando el campo "isInappropriate" como false por defecto
  const handleCreatePost = async () => {
    if (!newContent.trim()) {
      setCreateError("Por favor, ingresa el contenido de la conversación.");
      return;
    }
    setCreateLoading(true);
    setCreateError("");
    try {
      await addDoc(collection(db, "posts"), {
        username: getUsername(user),
        userAvatar: user.avatar || "",
        content: newContent.trim(),
        replies: 0,
        isInappropriate: false, // Campo agregado
        createdAt: serverTimestamp(),
        uid: user.uid,
      });
      const updatedPosts = await fetchPosts();
      setForumPosts(updatedPosts);
      setOpenCreate(false);
      setNewContent("");
    } catch (error) {
      console.error("Error al crear post:", error);
      setCreateError("Error al crear la conversación. Intenta de nuevo.");
    } finally {
      setCreateLoading(false);
    }
  };

  // Función para marcar un post como inapropiado (para guías y admin)
  // Al marcarlo, se actualiza el campo y se redirige a la página de moderación,
  // por lo que el post ya no se mostrará en el foro.
  const handleMarcarInapropiado = async () => {
    if (!selectedPost) return;
    try {
      await updateDoc(doc(db, "posts", selectedPost.id), {
        isInappropriate: true,
      });
      // Eliminamos el post de la lista local para que desaparezca de la vista
      setForumPosts(forumPosts.filter((post) => post.id !== selectedPost.id));
      // Cerramos el diálogo
      setSelectedPost(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error al marcar como inapropiado:", error);
    }
  };

  const isAuthPage = ["/login", "/register"].includes(router.pathname);
  const isHomePage = router.pathname === "/";
  const showBackButton = !isHomePage && !isAuthPage;

  return (
    <>
      <Header title="Foro" />
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
            py: 4,
          }}
        >
          <Typography variant="h3" sx={{ mb: 2 }}>
            Foro
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

        <Container maxWidth="lg">
          {/* Sección "Lo Más Relevante Hoy" */}
          <Typography variant="h4" sx={{ color: "#a6ff99" }}>
            Lo Más Relevante Hoy:
          </Typography>
          {loadingPosts ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress color="success" />
            </Box>
          ) : (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {forumPosts.slice(0, 3).map((post) => (
                <Grid item xs={12} md={4} key={post.id}>
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
                    onClick={() => handleOpenDialog(post)}
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

          {/* Buscador unificado */}
          <Box sx={{ backgroundColor: "white", p: 2, borderRadius: 1, mb: 4 }}>
            <UnifiedSearchBar
              searchCriterion={searchCriterion}
              onCriterionChange={setSearchCriterion}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
          </Box>

          {/* Listado de posts filtrados */}
          {loadingPosts ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress color="success" />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredPosts.map((post) => (
                <Grid item xs={12} md={4} key={post.id}>
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
                    onClick={() => handleOpenDialog(post)}
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
        </Container>
      </BackgroundLayout>

      {/* Dialog para ver detalles del post */}
      {selectedPost && (
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              alt={selectedPost.username || "Usuario"}
              src={selectedPost.userAvatar || undefined}
              sx={{ mr: 2, bgcolor: "#169505" }}
            >
              {!selectedPost.userAvatar && selectedPost.username
                ? selectedPost.username.charAt(0).toUpperCase()
                : null}
            </Avatar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {selectedPost.username}
            </Typography>
            <IconButton onClick={handleCloseDialog} color="inherit">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {selectedPost.content}
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Respuestas:
            </Typography>
            {responses.length === 0 ? (
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                No hay respuestas aún.
              </Typography>
            ) : (
              responses.map((resp) => (
                <Box key={resp.id} sx={{ mb: 2 }}>
                  <Typography variant="body2">{resp.username}</Typography>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {resp.content}
                  </Typography>
                </Box>
              ))
            )}
            {user ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2">Agrega tu respuesta:</Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    label="Respuesta"
                    fullWidth
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    color="success"
                    onClick={handleAddResponse}
                    disabled={responseLoading}
                  >
                    {responseLoading ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      "Responder"
                    )}
                  </Button>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ mt: 3, fontStyle: "italic" }}>
                Debes iniciar sesión para responder.
              </Typography>
            )}
            {/* Botón para marcar post como inapropiado (solo para guía o admin) */}
            {user &&
              (user.role === "guia" || user.role === "admin") &&
              !selectedPost.isInappropriate && (
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleMarcarInapropiado}
                    sx={{ textTransform: "none" }}
                  >
                    Marcar como inapropiado
                  </Button>
                </Box>
              )}
          </DialogContent>
        </Dialog>
      )}

      {/* Footer fijo para crear un nuevo post (solo para usuarios logueados) */}
      {user && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100vw",
            bgcolor: "#169505",
            py: 1,
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <Button
            variant="contained"
            color="success"
            sx={{ textTransform: "none" }}
            onClick={handleOpenCreate}
          >
            Iniciar Conversación
          </Button>
        </Box>
      )}

      {/* Dialog para crear nuevo post */}
      <Dialog
        open={openCreate}
        onClose={handleCloseCreate}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nueva Conversación</DialogTitle>
        <DialogContent dividers>
          {createError && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {createError}
            </Typography>
          )}
          <TextField
            label="¿Qué quieres compartir?"
            multiline
            rows={4}
            fullWidth
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
        </DialogContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 2,
            px: 3,
            py: 2,
          }}
        >
          <Button onClick={handleCloseCreate} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={createLoading}
            onClick={handleCreatePost}
          >
            {createLoading ? <CircularProgress size={24} /> : "Publicar"}
          </Button>
        </Box>
      </Dialog>
    </>
  );
};

export default Foro;
