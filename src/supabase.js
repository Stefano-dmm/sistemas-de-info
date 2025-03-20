import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://rlpdkgfkarjkrkmjlyvm.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscGRrZ2ZrYXJqa3JrbWpseXZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MjAzNTcsImV4cCI6MjA1Nzk5NjM1N30.Ua1tICv0ycitXx3qG3gWmC_C8JKJHDL9BkD8eu-a_4U";

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadImage = async (file, bucket, folder) => {
  try {
    const fileExt = file.name.split(".").pop();
    // Usamos backticks para interpolar correctamente las variables
    const fileName = `${Math.random()
      .toString(36)
      .substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Sube la imagen al bucket correcto (por ejemplo, "avilamet-perfil")
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Obtén la URL pública del archivo
    const { data: urlData, error: publicUrlError } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (publicUrlError) {
      throw publicUrlError;
    }

    return urlData.publicUrl;
  } catch (error) {
    console.error("Error al subir imagen:", error);
    throw error;
  }
};
