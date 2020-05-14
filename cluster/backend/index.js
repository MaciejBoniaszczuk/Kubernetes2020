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

const appPort = 5000;

app.get('/:key', (req, res) => {
  const { key } = req.params;
  redisClient.get(key, (err, value) => {
    if (err) {
      console.log(err);
      return res.send("Wystąpił błąd");
    }
    if (value !== null) {
      return res.send("Znaleziono w cache");
    }
    redisClient.set(key, "");
    return res.send("Dodano do cache");
  });
});

app.listen(appPort, () => {
    console.log(`Backend listenig on port ${appPort}`);
});