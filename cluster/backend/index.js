const keys = require('./keys');
const { v4: uuidv4 } = require("uuid");
const express = require('express');
const bodyParser = require('body-parser');

const redis = require('redis');

const app = express();
app.use(bodyParser.json());

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retry_strategy: () => 1000
});
const { Pool } = require('pg');
const appPort = 5000;
const appId = uuidv4();

const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
});
pgClient.on('error', () => {
  console.log('Error');
});

const connect = () => {
  pgClient.connect().then(() => {
    pgClient
      .query("CREATE TABLE IF NOT EXISTS requests (a varchar(255))")
      .catch((err) => {
        console.log(err);
      });
  }).catch(() => {
    setTimeout(() => {
      connect();
    }, 1000);
  });
}

connect();

const addResult = (a) => {
  return new Promise((resolve, reject) => {
    pgClient
      .query(
        "INSERT INTO requests (a) VALUES ($1)",
        [a]
      )
      .then(() => {
        resolve();
      })
      .catch((err) => {
        reject(err);
      });
  })
}
app.get('/', (req, res) => {
  return res.send(appName);
});

app.get('/results', (req, res) => {
  pgClient
    .query("SELECT * FROM requests")
    .then((data) => {
      return res.json(data.rows);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500);
    });
});

app.post('/', (req, res) => {
  const { key } = req.body;
  redisClient.get(key, async (err, value) => {
    if (err) {
      console.log(err);
      return res.send(`${appId} Wystąpił błąd`);
    }
    await addResult(key);
    if (value !== null) {
      return res.send(`${appId} Znaleziono w cache`);
    }
    redisClient.set(key, "");
    return res.send(`${appId} Dodano do cache`);
  });
});

app.listen(appPort, () => {
    console.log(`Backend listenig on port ${appPort}`);
});