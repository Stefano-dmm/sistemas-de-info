// src/components/Header.js
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/router";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const router = useRouter();
  const { pathname } = router;
  const { user, authLoading } = useAuth();
  const [adminAnchorEl, setAdminAnchorEl] = useState(null);

  // Verifica si el usuario es "guia" o "admin"
  const isAdminOrGuia = user && (user.role === "admin" || user.role === "guia");

  const handleLogoClick = (e) => {
    if (isAdminOrGuia) {
      setAdminAnchorEl(e.currentTarget);
    } else {
      router.push("/");
    }
  };

  const handleAdminMenuClose = () => {
    setAdminAnchorEl(null);
  };

  const handleMenuItemClick = (path) => {
    router.push(path);
    handleAdminMenuClose();
  };

  const isAuthPage = ["/login", "/register"].includes(pathname);
  const isHomePage = pathname === "/";
  const showBackButton = !isHomePage && !isAuthPage;

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: "success.main",
        boxShadow: "none",
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(22, 149, 5, 1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 3 }}>
        {/* Sección izquierda: Logo interactivo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {showBackButton && (
            <IconButton color="inherit" onClick={() => router.push("/")}>
              <ArrowBackIcon fontSize="medium" />
            </IconButton>
          )}
          <IconButton onClick={handleLogoClick} sx={{ p: 0 }}>
            <Image
              src="/logo.png"
              alt="AvilaMET Logo"
              width={40}
              height={40}
              priority
              style={{ objectFit: "contain" }}
            />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 700,
              letterSpacing: "0.5px",
              display: { xs: "none", sm: "block" },
            }}
          >
            AvilaMET
          </Typography>

          {isAdminOrGuia && (
            <Menu
              anchorEl={adminAnchorEl}
              open={Boolean(adminAnchorEl)}
              onClose={handleAdminMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
            >
              {user.role === "admin" ? (
                <>
                  {/* Opciones para ADMIN */}
                  <MenuItem
                    onClick={() => handleMenuItemClick("/admin-destinos")}
                  >
                    Admin Destinos
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleMenuItemClick("/admin-excursiones")}
                  >
                    Admin Excursiones
                  </MenuItem>
                  <MenuItem onClick={() => handleMenuItemClick("/admin-roles")}>
                    Admin Roles
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleMenuItemClick("/admin-contacto")}
                  >
                    Admin Contacto
                  </MenuItem>
                </>
              ) : (
                <>
                  {/* Opciones para GUÍA */}
                  <MenuItem
                    onClick={() => handleMenuItemClick("/guia-destinos")}
                  >
                    Guía Destinos
                  </MenuItem>
                  <MenuItem
                    onClick={() => handleMenuItemClick("/guia-excursiones")}
                  >
                    Guía Excursiones
                  </MenuItem>
                </>
              )}
            </Menu>
          )}
        </Box>

        {/* Sección derecha: Estado de autenticación */}
        {!isAuthPage && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {authLoading ? (
              <Skeleton
                variant="circular"
                width={40}
                height={40}
                animation="wave"
              />
            ) : user ? (
              <IconButton onClick={() => router.push("/profile")} sx={{ p: 0 }}>
                <Avatar
                  alt={user.displayName || "Perfil"}
                  src={user.avatar ? user.avatar : undefined}
                  sx={{
                    width: 40,
                    height: 40,
                    border: "2px solid white",
                    "&:hover": {
                      transform: "scale(1.1)",
                      transition: "transform 0.3s ease",
                    },
                  }}
                >
                  {!user.avatar && user.displayName?.charAt(0)}
                </Avatar>
              </IconButton>
            ) : (
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => router.push("/login")}
                sx={{
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: "8px",
                  px: 2,
                  py: 1,
                }}
              >
                Iniciar sesión
              </Button>
            )}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
