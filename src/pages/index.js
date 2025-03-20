// src/pages/index.js
import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardMedia,
  CircularProgress,
} from "@mui/material";
import { useRouter } from "next/router";
import BackgroundLayout from "../components/BackgroundLayout";
import Header from "../components/Header";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const Home = () => {
  const router = useRouter();
  const buttonStyle = {
    textTransform: "none",
    fontWeight: 500,
    borderRadius: "8px",
    px: 2,
    py: 1,
  };

  // Estados para posts y fotos
  const [forumPosts, setForumPosts] = useState([]);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [loadingForum, setLoadingForum] = useState(true);
  const [loadingGallery, setLoadingGallery] = useState(true);

  // Función para obtener posts desde Firestore (orden descendente por createdAt)
  const fetchForumPosts = async () => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setForumPosts(posts);
    } catch (error) {
      console.error("Error al cargar posts:", error);
    } finally {
      setLoadingForum(false);
    }
  };

  // Función para obtener fotos de la galería desde Firestore (orden descendente por createdAt)
  const fetchGalleryPhotos = async () => {
    try {
      const q = query(
        collection(db, "galeria_fotos"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const photos = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGalleryPhotos(photos);
    } catch (error) {
      console.error("Error al cargar la galería:", error);
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    fetchForumPosts();
    fetchGalleryPhotos();
  }, []);

  return (
    <>
      <Header title="AvilaMET" />
      <BackgroundLayout>
        {/* Sección inicial (banner, logo, texto y botones) */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            color: "#fff",
          }}
        >
          <Typography variant="h3" align="center" sx={{ mb: 2 }}>
            HOME
          </Typography>
          <Box
            sx={{
              width: "100%",
              height: "20px",
              backgroundColor: "#169505",
              my: 3,
            }}
          />

          <Container
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              maxWidth: "1200px",
              px: 2,
            }}
          >
            {/* Sección descriptiva */}
            <Box
              sx={{
                textAlign: { xs: "center", md: "left" },
                maxWidth: "400px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", md: "flex-start" },
                  mb: 2,
                }}
              >
                <img
                  src="/logo.png"
                  alt="AvilaMET logo"
                  style={{ width: 50, height: "auto", marginRight: 16 }}
                />
                <Typography variant="h4">AvilaMET</Typography>
              </Box>
              <Typography variant="body1">
                Subir ya es costumbre de todo alumno de la Unimet.
              </Typography>
            </Box>

            {/* Sección de botones de navegación */}
            <Stack spacing={2} sx={{ mt: { xs: 3, md: 0 } }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => router.push("/destinos")}
                sx={buttonStyle}
              >
                Destinos
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => router.push("/foro")}
                sx={buttonStyle}
              >
                Foro
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => router.push("/informacion")}
                sx={buttonStyle}
              >
                Información
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => router.push("/calendario")}
                sx={buttonStyle}
              >
                Calendario
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => router.push("/galeria")}
                sx={buttonStyle}
              >
                Galería
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => router.push("/donativos")}
                sx={buttonStyle}
              >
                Donativos
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => router.push("/contacto")}
                sx={buttonStyle}
              >
                Contacto
              </Button>
            </Stack>
          </Container>
        </Box>

        <Box
          sx={{
            width: "100%",
            height: "20px",
            backgroundColor: "#169505",
            my: 3,
          }}
        />

        {/* Publicaciones destacadas del foro */}
        <Box sx={{ py: 5 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: "bold",
                textAlign: "left",
                color: "#a6ff99",
              }}
            >
              Publicaciones destacadas del foro
            </Typography>
            {loadingForum ? (
              <Box sx={{ textAlign: "center", py: 2 }}>
                <CircularProgress color="success" />
              </Box>
            ) : (
              <Grid container spacing={3}>
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
                      onClick={() => router.push("/foro")}
                    >
                      <CardHeader
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
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold" }}
                        >
                          Respuestas: {post.replies ?? 0}
                        </Typography>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        </Box>

        {/* Momentos destacados de la galería */}
        <Box sx={{ py: 5 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: "bold",
                textAlign: "right",
                color: "#a6ff99",
              }}
            >
              Momentos destacados de la galería
            </Typography>
            {loadingGallery ? (
              <Box sx={{ textAlign: "center" }}>
                <CircularProgress color="success" />
              </Box>
            ) : (
              <Grid container spacing={3}>
                {galleryPhotos.slice(0, 3).map((photo) => (
                  <Grid item xs={12} sm={6} md={4} key={photo.id}>
                    <Card
                      sx={{
                        cursor: "pointer",
                        "&:hover": {
                          transform: "scale(1.03)",
                          transition: "transform 0.3s ease-in-out",
                        },
                      }}
                      onClick={() => router.push("/galeria")}
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
        </Box>

        {/* Apoya nuestro proyecto */}
        <Box sx={{ py: 1, backgroundColor: "#0b5a0b" }}>
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              align="center"
              sx={{ mb: 2, color: "#fff" }}
            >
              Apoya nuestro proyecto
            </Typography>
            <Typography
              variant="body1"
              align="center"
              sx={{ mb: 3, color: "#fff" }}
            >
              Con tu donativo, podemos seguir mejorando AvilaMET y ofrecer más
              experiencias y servicios. ¡Gracias por tu ayuda!
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Button
                variant="contained"
                color="success"
                onClick={() => router.push("/donativos")}
                sx={{ textTransform: "none" }}
              >
                Dona Ahora
              </Button>
            </Box>
          </Container>
        </Box>
      </BackgroundLayout>
    </>
  );
};

export default Home;
