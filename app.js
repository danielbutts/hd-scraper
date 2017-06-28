const express = require('express');
const links = require('./routes/links');
require('dotenv').config();

const app = express();

app.use('/links', links);

const PORT = process.env.PORT || '3000';
app.listen(PORT);

console.log(`Listening on port ${PORT}`);

module.exports = app;
