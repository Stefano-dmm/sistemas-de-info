// src/pages/galeria.js
import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CardHeader,
  Avatar,
  TextField,
  CircularProgress,
  Alert,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
} from "@mui/material";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  updateDoc,
  doc,
  query,
  where,
  orderBy,
} from "firebase/firestore"; // Importamos query, where, orderBy
import { db } from "../firebase";
import { uploadImage } from "../supabase";
import { useAuth } from "../context/AuthContext";

// Función auxiliar para obtener el username a partir del objeto user
const getDisplayUsername = (user) => {
  if (user.displayName && user.displayName.trim() !== "")
    return user.displayName;
  if (user.email) return user.email.split("@")[0];
  return "Usuario";
};

// Componente de buscador unificado para la galería
const UnifiedSearchBar = ({
  searchCriterion,
  onCriterionChange,
  searchTerm,
  onSearchTermChange,
}) => {
  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel id="galeria-search-criterion-label">Buscar por</InputLabel>
        <Select
          labelId="galeria-search-criterion-label"
          value={searchCriterion}
          label="Buscar por"
          onChange={(e) => onCriterionChange(e.target.value)}
        >
          <MenuItem value="usuario">Usuario</MenuItem>
          <MenuItem value="info">Nombre/Descripción</MenuItem>
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

const Galeria = () => {
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Estados para el formulario de subida
  const [openUpload, setOpenUpload] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "" });
  const [imageFile, setImageFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Estados para el buscador unificado
  const [searchCriterion, setSearchCriterion] = useState("usuario");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPhotos, setFilteredPhotos] = useState([]);

  const { user } = useAuth();

  // Cargar fotos desde Firestore, solo las que no estén marcadas como inapropiadas
  useEffect(() => {
    const fetchGalleryPhotos = async () => {
      setLoadingGallery(true);
      try {
        // Usamos la consulta con where("isInappropriate", "==", false)
        // y orderBy("createdAt", "desc") si deseas ordenarlas por fecha
        const q = query(
          collection(db, "galeria_fotos"),
          where("isInappropriate", "==", false),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const photos = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        setGalleryPhotos(photos);
      } catch (error) {
        console.error("Error al cargar la galería:", error);
      } finally {
        setLoadingGallery(false);
      }
    };
    fetchGalleryPhotos();
  }, []);

  // Filtrar fotos según criterio y término de búsqueda
  useEffect(() => {
    const filtered = galleryPhotos.filter((photo) => {
      // Si no hay término de búsqueda, se muestran todas
      if (searchTerm.trim() === "") return true;

      if (searchCriterion === "usuario") {
        return photo.username.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (searchCriterion === "info") {
        return (
          photo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          photo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    });
    setFilteredPhotos(filtered);
  }, [galleryPhotos, searchCriterion, searchTerm]);

  const handleOpenDialog = (photo) => {
    setSelectedPhoto(photo);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedPhoto(null);
    setOpenDialog(false);
  };

  // Función para marcar la foto como inapropiada
  const handleMarkInappropriate = async () => {
    if (!selectedPhoto) return;
    try {
      await updateDoc(doc(db, "galeria_fotos", selectedPhoto.id), {
        isInappropriate: true,
      });
      // Actualizamos el estado local para que la foto ya no aparezca en la lista
      setGalleryPhotos(
        galleryPhotos.filter((photo) => photo.id !== selectedPhoto.id)
      );
      // Cerramos el diálogo
      setSelectedPhoto(null);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error al marcar la imagen como inapropiada:", error);
    }
  };

  // Manejo del formulario de subida
  const handleUploadOpen = () => {
    setUploadError("");
    setUploadSuccess("");
    setFormData({ nombre: "", descripcion: "" });
    setImageFile(null);
    setOpenUpload(true);
  };

  const handleUploadClose = () => {
    setOpenUpload(false);
  };

  const handleFormChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const isUploadFormValid = () => {
    return (
      formData.nombre.trim() !== "" &&
      formData.descripcion.trim() !== "" &&
      imageFile !== null
    );
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");
    if (!isUploadFormValid()) {
      setUploadError(
        "Por favor, completa todos los campos y selecciona una imagen."
      );
      return;
    }
    setUploadLoading(true);
    try {
      // Subir la imagen a Supabase en el bucket "avilamet-perfil" en la carpeta "galeria_fotos"
      const imageUrl = await uploadImage(
        imageFile,
        "avilamet-perfil",
        "galeria_fotos"
      );
      // Guardar documento en Firestore, usando getDisplayUsername para el username
      await addDoc(collection(db, "galeria_fotos"), {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        imagen: imageUrl,
        postedBy: user.uid,
        username: getDisplayUsername(user),
        userAvatar: user.avatar || "",
        createdAt: serverTimestamp(),
        isInappropriate: false, // Campo agregado para moderación
      });
      setUploadSuccess("Imagen agregada a la galería exitosamente.");

      // Volvemos a cargar solo las fotos isInappropriate: false
      const q = query(
        collection(db, "galeria_fotos"),
        where("isInappropriate", "==", false),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const photos = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setGalleryPhotos(photos);

      // Limpiar formulario
      setFormData({ nombre: "", descripcion: "" });
      setImageFile(null);
    } catch (error) {
      console.error("Error al subir imagen a la galería:", error);
      setUploadError("Error al subir la imagen: " + error.message);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <>
      <Header title="Galería" />
      <BackgroundLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Banner */}
          <Typography variant="h3" align="center" sx={{ mb: 2, color: "#fff" }}>
            Galería
          </Typography>
          <Box
            sx={{
              position: "relative",
              left: "calc(50% - 50vw)",
              width: "100vw",
              height: "20px",
              backgroundColor: "#169505",
              mb: 3,
            }}
          />

          {/* Buscador unificado con fondo blanco */}
          <Box sx={{ backgroundColor: "white", p: 2, borderRadius: 1, mb: 4 }}>
            <UnifiedSearchBar
              searchCriterion={searchCriterion}
              onCriterionChange={setSearchCriterion}
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
            />
          </Box>

          {/* Listado de publicaciones filtradas */}
          {loadingGallery ? (
            <Box sx={{ textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={4}>
              {filteredPhotos.map((photo) => (
                <Grid item xs={12} sm={6} md={4} key={photo.id}>
                  <Card
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        transform: "scale(1.03)",
                        transition: "transform 0.3s ease-in-out",
                      },
                    }}
                    onClick={() => handleOpenDialog(photo)}
                  >
                    <CardMedia
                      component="img"
                      image={photo.imagen}
                      alt={photo.nombre}
                      sx={{ height: 200, objectFit: "cover" }}
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </BackgroundLayout>

      {/* Dialog para mostrar detalles de la imagen */}
      {selectedPhoto && (
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
        >
          <CardHeader
            avatar={
              <Avatar
                alt={selectedPhoto.username}
                src={selectedPhoto.userAvatar || undefined}
                sx={{ bgcolor: "#169505" }}
              >
                {!selectedPhoto.userAvatar &&
                  selectedPhoto.username &&
                  selectedPhoto.username.charAt(0).toUpperCase()}
              </Avatar>
            }
            title={selectedPhoto.username}
            action={
              <Button onClick={handleCloseDialog} color="inherit">
                <CloseIcon />
              </Button>
            }
            sx={{ pb: 0 }}
          />
          <DialogTitle sx={{ display: "none" }} />
          <DialogContent dividers>
            <Box sx={{ textAlign: "center" }}>
              <img
                src={selectedPhoto.imagen}
                alt={selectedPhoto.nombre}
                style={{
                  width: "100%",
                  maxHeight: "400px",
                  objectFit: "cover",
                  marginBottom: "16px",
                }}
              />
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedPhoto.descripcion}
              </Typography>
            </Box>
            {user &&
              (user.role === "guia" || user.role === "admin") &&
              !selectedPhoto.isInappropriate && (
                <Box sx={{ textAlign: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={handleMarkInappropriate}
                  >
                    Marcar como inapropiado
                  </Button>
                </Box>
              )}
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog para subir una imagen a la galería */}
      <Dialog
        open={openUpload}
        onClose={handleUploadClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Subir Imagen a la Galería</DialogTitle>
        <DialogContent>
          {uploadError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {uploadError}
            </Alert>
          )}
          {uploadSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {uploadSuccess}
            </Alert>
          )}
          <Box
            component="form"
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Nombre de la imagen"
              name="nombre"
              value={formData.nombre}
              onChange={handleFormChange}
              fullWidth
              required
            />
            <TextField
              label="Descripción"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleFormChange}
              fullWidth
              multiline
              rows={3}
              required
            />
            <Button variant="contained" component="label" color="primary">
              Seleccionar Imagen
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {imageFile && (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Imagen seleccionada: {imageFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadClose} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={handleUploadSubmit}
            variant="contained"
            color="primary"
            disabled={uploadLoading}
          >
            {uploadLoading ? <CircularProgress size={24} /> : "Subir Imagen"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pie de página fijo con botón para subir nueva imagen */}
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
            onClick={handleUploadOpen}
          >
            Agrega tus recuerdos de excursiones
          </Button>
        </Box>
      )}
    </>
  );
};

export default Galeria;
