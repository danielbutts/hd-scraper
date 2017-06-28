const express = require('express');
const index = require('./routes/index');

const app = express();

app.use('/', index);

const PORT = process.env.PORT || '3000';
app.listen(PORT);

console.log(`Listening on port ${PORT}`);

module.exports = app;
