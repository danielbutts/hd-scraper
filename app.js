const express = require('express');
const links = require('./routes/links');
const pages = require('./routes/pages');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/links', links);
app.use('/pages', pages);

const PORT = process.env.PORT || '3000';
app.listen(PORT);

console.log(`Listening on port ${PORT}`);

module.exports = app;
