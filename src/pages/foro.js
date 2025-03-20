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
  CircularProgress,
  TextField,
  IconButton,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
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
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

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
 * Obtiene todos los posts de la colección "posts", ordenados por fecha descendente
 */
async function fetchPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
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
      // Si no se ingresa término, se muestran todos
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

  // Agregar respuesta: después de agregar, se vuelve a contar la subcolección y se actualiza el campo "replies"
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

  // Crear nuevo post
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

  return (
    <>
      <Header title="Foro" />
      <BackgroundLayout>
        {/* Banner Original */}
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
          {/* Sección "Lo Más Relevante Hoy": Mostrar solo los 3 posts más recientes */}
          <Typography
            variant="h4"
            sx={{ mb: 4, fontWeight: "bold", color: "#a6ff99" }}
          >
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
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {post.username}
                        </Typography>
                      }
                    />
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

          {/* Buscador unificado con fondo blanco */}
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
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                          {post.username}
                        </Typography>
                      }
                    />
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
        </Container>
      </BackgroundLayout>

      {/* Dialog para mostrar detalles del post y responder */}
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
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Respuestas:
            </Typography>
            {responses.length === 0 ? (
              <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                No hay respuestas aún.
              </Typography>
            ) : (
              responses.map((resp) => (
                <Box key={resp.id} sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {resp.username}
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 2 }}>
                    {resp.content}
                  </Typography>
                </Box>
              ))
            )}
            {user ? (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                  Agrega tu respuesta:
                </Typography>
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
          </DialogContent>
        </Dialog>
      )}

      {/* Pie de página fijo con botón para iniciar conversación */}
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
