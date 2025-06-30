import express from "express";
import mssql from "mssql";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

// Para poder usar __dirname con ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de conexión a SQL Server
const config = {
  user: "sa",                // Tu usuario de SQL Server
  password: "1111",          // Tu contraseña
  server: "localhost",       // Tu servidor
  database: "Niurlxth",      // Tu base de datos
  options: {
    encrypt: false,          
    trustServerCertificate: true
  }
};

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Para recibir imágenes base64 grandes
app.use(express.static(__dirname)); // Servir archivos estáticos (HTML, CSS, JS, imágenes)

/**
 * Ruta para servir tu página principal
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

/**
 * Ruta POST para guardar imagen en la base de datos
 * Recibe: nombre, tipo (MIME), y base64data (sin prefijo)
 */
app.post("/api/imagen", async (req, res) => {
  console.log("Recibiendo imagen para guardar..."); // Debug
  
  const { nombre, tipo, base64data } = req.body;
  
  // Validar que lleguen todos los datos
  if (!nombre || !tipo || !base64data) {
    console.log("Faltan datos:", { nombre, tipo, base64data: base64data ? "presente" : "faltante" });
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    // Convertir base64 a Buffer para guardar como binario
    const buffer = Buffer.from(base64data, "base64");
    console.log(`Guardando imagen: ${nombre}, Tipo: ${tipo}, Tamaño: ${buffer.length} bytes`);
    
    // Conectar a la base de datos
    await mssql.connect(config);
    const request = new mssql.Request();
    
    // Preparar los parámetros para la consulta SQL
    request.input("nombre", mssql.NVarChar(255), nombre);
    request.input("tipo", mssql.NVarChar(50), tipo);
    request.input("datos", mssql.VarBinary(mssql.MAX), buffer);
    
    // Insertar en la tabla Imagenes
    await request.query(
      "INSERT INTO Imagenes (nombre, tipo, datos) VALUES (@nombre, @tipo, @datos)"
    );
    
    console.log(`Imagen ${nombre} guardada exitosamente`);
    res.json({ mensaje: "Imagen guardada correctamente", nombre: nombre });
    
  } catch (err) {
    console.error("Error al guardar imagen:", err);
    res.status(500).json({ 
      error: "Error al guardar la imagen", 
      detalles: err.message 
    });
  } finally {
    // Siempre cerrar la conexión
    try {
      await mssql.close();
    } catch (closeErr) {
      console.error("Error al cerrar conexión:", closeErr);
    }
  }
});

/**
 * Ruta para obtener una imagen de la base de datos (opcional)
 */
app.get("/api/imagen/:id", async (req, res) => {
  const { id } = req.params;
  
  try {
    await mssql.connect(config);
    const request = new mssql.Request();
    request.input("id", mssql.Int, id);
    
    const result = await request.query(
      "SELECT nombre, tipo, datos FROM Imagenes WHERE id = @id"
    );
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: "Imagen no encontrada" });
    }
    
    const imagen = result.recordset[0];
    res.set('Content-Type', imagen.tipo);
    res.send(imagen.datos);
    
  } catch (err) {
    console.error("Error al obtener imagen:", err);
    res.status(500).json({ error: "Error al obtener la imagen" });
  } finally {
    await mssql.close();
  }
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📁 Sirviendo archivos desde: ${__dirname}`);
});

async function probarConexion() { 
    try {
        await mssql.connect(Configuracion);
        console.log('Conexión exitosa');
        await mssql.close();
    } catch (err) {
        console.error('Error de conexión:', err);
    }
}