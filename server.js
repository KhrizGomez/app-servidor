import mssql from "mssql";

const config = {
  user: "khriz",               
  password: "Abc12345",         
  server: "mssql-199095-0.cloudclusters.net",     
  database: "Niurlxth",      
  port: 19953,
  options: {
    encrypt: true,          
    trustServerCertificate: true
  }
};

async function iniciarConexion() { 
    try {
        let pool = await mssql.connect(config);
        console.log('Conexión a BD exitosa');
    } catch (err) {
        console.error('Error de conexión:', err);
    }
}

iniciarConexion();