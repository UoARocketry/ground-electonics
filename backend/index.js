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
  
  // Release the connection when done
  connection.release();
});


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));


const wss = new WebSocket.Server({ port: 3002 });
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    console.log(`Received message => ${message}`);
  });


  pool.query("SELECT x, y, z FROM relitive ORDER BY id ASC", (err, res) => {
    if (err) {
      console.error("Error querying the database:", err);
      return;
    }
    ws.send(JSON.stringify(res));
  });

  console.log("Client connected");


  ws.on("close", () => {
    console.log("Client disconnected");
  });
});



app.get("/api", (req, res) => res.send("Hello World!"));

app.post("/api/update", (req, res) => {

  r = 6371000 + req.body.alt;
  x = r*Math.cos(req.body.lat)*Math.sin(req.body.lon)
  y = r*Math.sin(req.body.lat)*Math.sin(req.body.lon)
  z = r*Math.cos(req.body.lon)

  pool.query('SELECT x, y, z FROM cartesian ORDER BY id DESC LIMIT 1', (err, res) => {
    if (err) {
      console.error("Error querying the database:", err);
      return;
      }
      const root = res[0];
      if (root == null) {
        //Update cartesian coordinates and insert first relitive coordinate
        pool.query('INSERT INTO cartesian (x, y, z) VALUES (?, ?, ?)', [x, y, z], (err, res) => {
          if (err) {
            console.error("Error querying the database:", err);
            return;
          }
        });

        pool.query('INSERT INTO relitive (x, y, z) VALUES (?, ?, ?)', [0, 0, 0], (err, res) => {
          if (err) {
            console.error("Error querying the database:", err);
            return;
          }
        });
        return 
      }

      pool.query('INSERT INTO relitive (x, y, z) VALUES (?, ?, ?)', [x - root.x, y - root.y, z - root.z], (err, res) => {
        if (err) {
          console.error("Error querying the database:", err);
          return;
        }

        wss.clients.forEach((client) => {
          pool.query("SELECT x, y, z FROM relitive ORDER BY id ASC", (err, res) => {
            if (err) {
              console.error("Error querying the database:", err);
              return;
            }
            client.send(JSON.stringify(res));
          });
        });
      });

      pool.query('INSERT INTO gps (r, lat, lon) VALUES (?, ?, ?)', [req.body.alt, req.body.lat, req.body.lon], (err, res) => {
        if (err) {
          console.error("Error querying the database:", err);
          return;
        }
      });
  });


  // wss.clients.forEach((client) => {
  //   client.send(JSON.stringify(req.body));
  // });

  res.sendStatus(200);
});

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
