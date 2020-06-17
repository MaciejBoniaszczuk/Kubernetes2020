// const url = require('url');
const keys = require('./keys');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

// REDIS SETUP

const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort
});

// PostgreSQL SETUP
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on('error', () => console.log('No connection to Database!'));

pgClient.query('CREATE TABLE IF NOT EXISTS results(' +
    'kapital FLOAT, ' +
    'zysk FLOAT, ' +
    'roe FLOAT);').catch(err => console.log(err));

// Kalkulator wskaźnika ROE

app.get('/:k/:z', (req, resp) => {


    var kapital = req.params.k.replace(",", ".");
    var zysk = req.params.z.replace(",", ".");


    var redis_key = kapital + "-" + zysk;

    redisClient.get(redis_key, (err, result) => {
        if (result) 
        {
            resp.send(result.toString().replace(".", ","));
        } else {
            var roe = 0.0;


            roe = ((zysk / kapital) * 100).toFixed(2);


            var query_string = "INSERT INTO results (kapital, zysk, roe) " +
                "VALUES ('" + kapital + "', '" + zysk + "', '" + roe + "');";
            console.log("[PostgreSQL] Executing query...");
            console.log("[PostgreSQL] " + query_string);
            pgClient.query(query_string).catch(err => console.log(err));


            console.log("[REDIS] Inserting key-value...");
            console.log("[REDIS]" + redis_key + " ==> " + roe);
            redisClient.set(redis_key, roe);


            resp.send(roe.toString().replace(".", ","));
        }
    });
});

app.get('/', (req, resp) => {
    resp.send('Hello from Kalkulator ROE');
});

app.listen(4000, err => {
    console.log('Server is listening on port 4000');
});