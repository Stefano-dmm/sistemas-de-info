// src/components/SearchBar.jsx
import React from "react";
import { TextField, Box } from "@mui/material";

const SearchBar = ({
  userFilter,
  onUserFilterChange,
  searchTerm,
  onSearchTermChange,
}) => {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
      <TextField
        label="Filtrar por usuario"
        value={userFilter}
        onChange={(e) => onUserFilterChange(e.target.value)}
        variant="outlined"
      />
      <TextField
        label="Buscar palabras clave"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
        variant="outlined"
      />
    </Box>
  );
};

export default SearchBar;
