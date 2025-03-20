// src/components/ImageUploader.js
import React, { useState } from "react";
import { Button, Typography, CircularProgress } from "@mui/material";
import { uploadImage } from "../supabase";

const ImageUploader = ({ bucket, folder, onUploadComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLoading(true);
      setError("");
      try {
        // Sube la imagen a Supabase usando el bucket y folder pasados por props
        const imageUrl = await uploadImage(file, bucket, folder);
        onUploadComplete(imageUrl);
      } catch (err) {
        console.error("Error al subir imagen:", err);
        setError("Error al subir la imagen.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <Button variant="contained" component="label" color="primary">
        Seleccionar Imagen
        <input
          type="file"
          hidden
          accept="image/*"
          onChange={handleImageChange}
        />
      </Button>
      {loading && <CircularProgress size={24} sx={{ ml: 1 }} />}
      {error && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </div>
  );
};

export default ImageUploader;
