import mssql from "mssql";

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

async function probarConexion() { 
    try {
        await mssql.connect(Configuracion);
        console.log('Conexión exitosa');
        await mssql.close();
    } catch (err) {
        console.error('Error de conexión:', err);
    }
}