import React from "react";
import Header from "./Header";
import { Container, Box, Typography } from "@mui/material";

const Home = () => {
  return (
    <div>
      <Header />
      <Container>
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Prueba
          </Typography>
          <Typography variant="body1">Hola</Typography>
        </Box>
      </Container>
    </div>
  );
};

export default Home;
