require("dotenv").config({ path: "../.env" });
const mariadb = require("mariadb/callback");
const express = require("express");
var cors = require("cors");
const WebSocket = require("ws");
const { ER_SELF_SIGNED } = require("mariadb/lib/misc/errors");
const PoolCallback = require("mariadb/lib/pool-callback");

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


  pool.query("SELECT x, y, z FROM gps ORDER BY id ASC", (err, res) => {
    if (err) {
      console.error("Error querying the database:", err);
      return;
    }
    //Get last known GPS coordinate
    pool.query("SELECT lat, lon, alt FROM gps ORDER BY id DESC LIMIT 1", (error, respose) => {
      if (err) {
        console.error("Error querying the database:", err);
        return;
      }
      console.log(respose);
      ws.send(JSON.stringify({"relitive": res, "gps": respose[0]}));
    } )

  });

  console.log("Client connected");


  ws.on("close", () => {
    console.log("Client disconnected");
  });
});



app.get("/api", (req, res) => res.send("Hello World!"));

var root_pos = null;


app.post("/api/update", (req, res) => {

  r = 6371000 + req.body.alt;
  x = r*Math.cos(req.body.lat)*Math.sin(req.body.lon)
  y = r*Math.sin(req.body.lat)*Math.sin(req.body.lon)
  z = r*Math.cos(req.body.lon)

  if (root_pos == null) {
    console.log("Root position not set, setting to current position");
    pool.query('SELECT absx, absy, absz FROM gps ORDER BY id DESC LIMIT 1', (err, res) => {
      if (err) {
        console.error("Error querying the database:", err);
        return;
      }
      console.log(res);
      root_pos = {'x': res[0]?.absx ?? null, 'y': res[0]?.absy ?? null, 'z': res[0]?.absz ?? null};
      if (root_pos.x == null) {
        root_pos = {'x': x, 'y': y, 'z': z};
      }
      pool.query('INSERT INTO gps (x, y, z, lat, lon, alt, absx, absy, absz) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [x - root_pos.x, y - root_pos.y, z - root_pos.z, req.body.lat*180/Math.PI, req.body.lon*180/Math.PI,  req.body.alt, x, y, z], (err, res) => {
      if (err) {
        console.error("Error querying the database:", err);
        return;
      }

      wss.clients.forEach((client) => {
        client.send(JSON.stringify({"relitive" : [{'x': Math.round(x - root_pos.x), "y": Math.round(y - root_pos.y), "z": Math.round(z - root_pos.z)}], "gps": {"lat": req.body.lat*180/Math.PI, "lon" : req.body.lon*180/Math.PI, "alt": req.body.alt}}));      });
    });
    });


  } else {
    pool.query('INSERT INTO gps (x, y, z, lat, lon, alt, absx, absy, absz) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
      [x - root_pos.x, y - root_pos.y, z - root_pos.z, req.body.lat*180/Math.PI, req.body.lon*180/Math.PI, req.body.alt, x, y, z], (err, res) => {
      if (err) {
        console.error("Error querying the database:", err);
        return;
      }

      wss.clients.forEach((client) => {
          client.send(JSON.stringify({"relitive" : [{'x': Math.round(x - root_pos.x), "y": Math.round(y - root_pos.y), "z": Math.round(z - root_pos.z)}], "gps": {"lat": req.body.lat*180/Math.PI, "lon" : req.body.lon*180/Math.PI, "alt": req.body.alt}}));
      });
    });
  }


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
