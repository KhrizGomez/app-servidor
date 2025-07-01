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

async function probarConexion() { 
    try {
        await mssql.connect(config);
        console.log('Conexión exitosa');
        await mssql.close();
    } catch (err) {
        console.error('Error de conexión:', err);
    }
}

probarConexion();