require("dotenv").config({ path: "../.env" });
const mariadb = require("mariadb/callback");
const express = require("express");
var cors = require("cors");
const WebSocket = require("ws");
const { ER_SELF_SIGNED } = require("mariadb/lib/misc/errors");

console.log(process.env.DB_HOST);

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

// Get a connection from the pool
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to MariaDB:", err);
    return;
  }

  console.log("Connected to MariaDB!");

  // Use the connection for database operations

  // Release the connection when done
  connection.release();
});



// createTable();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


const wss = new WebSocket.Server({ port: 3002 });
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log(`Received message => ${message}`);
  });
  
  var lastID = null;

  setInterval(() => {
    pool.query("SELECT * FROM data WHERE id > " + (lastID ?? 0), (error, results) => {
      if (error) {
        console.error("Error querying the database:", error);
        return;
      }
      if (results.length == 0) return;
      pool.query("SELECT * FROM data ORDER BY id ASC", (err, res) => {
        if (err) {
          console.error("Error querying the database:", err);
          return;
        }
        lastID = res[res.length - 1].id; // Set lastID to the last element in the result list
        console.log("Query results:", res);
        ws.send(JSON.stringify(res));
      });
    });
  }, 500);

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

app.get("/api", (req, res) => res.send("Hello World!"));

app.get("/api/all", async (req, res) => {
  pool.query("SELECT * FROM data", (err, results) => {
    if (err) {
      console.error("Error querying the database:", err);
      return;
    }

    // 'results' contains the rows retrieved from the database
    console.log("Query results:", results);
    res.json(results);
  });
});

app.listen(3001, () => console.log(`App running on port 3001.`));
