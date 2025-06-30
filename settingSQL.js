import express from "express";
import mssql from "mssql";
import cors from "cors";

const Configuracion = {
    server: "localhost",
    database: "Niurlxth",
    user: "sa",
    password: "1111",
    port: 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
}

const app = express();
app.use(cors()); // Permitir peticiones desde otros orígenes (CORS)
app.use(express.json({ limit: '10mb' })); // Permitir recibir JSON grandes (imágenes en base64)

/**
 * Ruta POST para guardar imagen en la base de datos.
 * Espera recibir: nombre, tipo (MIME), y base64data (sin prefijo).
 */
app.post("/api/imagen", async (req, res) => {
  const { nombre, tipo, base64data } = req.body;
  if (!nombre || !tipo || !base64data) {
    // Validar que llegan todos los campos
    return res.status(400).json({ error: "Faltan datos" });
  }
  // Convertir base64 a Buffer para guardar como binario
  const buffer = Buffer.from(base64data, "base64");
  try {
    await mssql.connect(config); // Conexión a la base de datos
    const request = new mssql.Request();
    // Parámetros para la consulta SQL
    request.input("nombre", mssql.NVarChar(255), nombre);
    request.input("tipo", mssql.NVarChar(50), tipo);
    request.input("datos", mssql.VarBinary(mssql.MAX), buffer);
    // Insertar en la tabla Imagenes (ver SQL más abajo)
    await request.query(
      "INSERT INTO Imagenes (nombre, tipo, datos) VALUES (@nombre, @tipo, @datos)"
    );
    res.json({ mensaje: "Imagen guardada correctamente." }); // Respuesta de éxito
  } catch (err) {
    // Si hay error, lo mostramos
    res.status(500).json({ error: "Error al guardar la imagen", detalles: err.message });
  } finally {
    await mssql.close(); // Siempre cerrar la conexión
  }
});

// Arrancar el servidor en el puerto 3000
app.listen(3000, () => {
  console.log("Servidor escuchando en puerto 3000");
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