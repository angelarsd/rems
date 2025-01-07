const http = require('http');
const express = require('express');
require("dotenv").config();
const {Client} = require('pg');

const CONFIG_DB = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    ssl: {
      rejectUnauthorized: true, // Configuración para conexiones SSL
    },
  };
const PORT = 3000;

const app = express();
const db = new Client(CONFIG_DB);
app.use(express.json());

app.use(async (req, res, next) => {
    try {
      if (!db._connected) {
        await db.connect();
        db._connected = true;
      }
      next();
    } catch (err) {
      console.error("Error conectando a la base de datos:", err);
      res.status(500).send("Error conectando a la base de datos");
    }
  });

app.get('/data', async (req, res) => {
    try{
        const result = await db.query("select * from test");
        res.json (result.rows);
    } catch (err) {
        console.error("Error conectando a la base de datos:", err);
        res.status(500).send("Error conectando a la base de datos");
      }
});

app.get('/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`SELECT * from test WHERE id =${id}`);
    
        if (!result.rows[0]) {
          return res.status(404).json({ error: "Resource not found" });
        }
    
        res.json(result.rows[0]);
      } catch (err) {
        console.error("Error ejecutando la consulta:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
      }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);

  });

  process.on("SIGINT", async () => {
    console.log("Cerrando la conexión...");
    if (db._connected) {
      await db.end();
    }
    process.exit();
  });