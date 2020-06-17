const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const random_number = Math.random();

app.get("/", (req, res) => {
   return res.json(random_number);
});

app.listen(4000, () => {
    console.log('Server listenig on port 4000');
});