// src/pages/admin-roles.js
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  TextField,
} from "@mui/material";
import { useRouter } from "next/router";
import Header from "../components/Header";
import BackgroundLayout from "../components/BackgroundLayout";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const AdminRoles = () => {
  // --- Verificación de rol ADMIN ---
  const { user, authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== "admin") {
        router.push("/");
      }
    }
  }, [user, authLoading, router]);

  if (authLoading) return null;
  if (user && user.role !== "admin") return null;

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updateMessage, setUpdateMessage] = useState("");
  const [searchEmail, setSearchEmail] = useState("");

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const usersData = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUpdateMessage("Rol actualizado correctamente.");
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      console.error("Error al actualizar rol:", error);
      setUpdateMessage("Error al actualizar rol.");
    }
  };

  // Filtrar usuarios por correo
  const filteredUsers = users.filter((u) =>
    u.email?.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <>
      <Header title="Admin: Cambiar Roles" />
      <BackgroundLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Typography
            variant="h4"
            sx={{ mb: 3, color: "#fff", textAlign: "center" }}
          >
            Panel de Administración de Roles
          </Typography>

          {updateMessage && <Alert severity="info">{updateMessage}</Alert>}

          {/* Buscador por correo */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Buscar por correo"
              variant="outlined"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              sx={{ backgroundColor: "white" }}
            />
          </Box>

          {loadingUsers ? (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress color="success" />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredUsers.map((usr) => (
                <Grid item xs={12} key={usr.id}>
                  <Card sx={{ display: "flex", alignItems: "center", p: 2 }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">{usr.username}</Typography>
                      <Typography variant="body2">{usr.email}</Typography>
                      <Typography variant="body2">Rol: {usr.role}</Typography>
                    </CardContent>
                    <CardActions>
                      <FormControl sx={{ minWidth: 120 }} size="small">
                        <InputLabel id={`role-label-${usr.id}`}>Rol</InputLabel>
                        <Select
                          labelId={`role-label-${usr.id}`}
                          value={usr.role}
                          label="Rol"
                          onChange={(e) =>
                            handleRoleChange(usr.id, e.target.value)
                          }
                        >
                          <MenuItem value="estudiante">Estudiante</MenuItem>
                          <MenuItem value="guia">Guía</MenuItem>
                          <MenuItem value="admin">Admin</MenuItem>
                        </Select>
                      </FormControl>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </BackgroundLayout>
    </>
  );
};

export default AdminRoles;
