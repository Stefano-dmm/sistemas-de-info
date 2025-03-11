import React from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

const HeaderLogin = () => {
  const navigate = useNavigate();

  const handleHomeRedirect = () => {
    navigate("/");
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        position="fixed"
        sx={{ width: "100wv", backgroundColor: "green" }}
      >
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={handleHomeRedirect}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* Logo en el navbar */}
          <Box sx={{ display: "flex", alignItems: "center", marginRight: 2 }}>
            <img
              src={logo}
              alt="Logo"
              style={{
                width: 40,
                height: "auto",
                marginRight: 10,
              }}
            />
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            AvilaMET
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default HeaderLogin;
