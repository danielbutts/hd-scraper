const express = require('express');
const rp = require('request-promise');
const cheerio = require('cheerio');
const knex = require('./db/connection');

const app = express();

const BASE_URL = 'http://www.homedepot.com/';

app.get('/scrape', (req, res) => {
  knex('links').then((result) => {
    const existingLinks = {};
    if (Array.isArray(result)) {
      result.forEach((row) => {
        existingLinks[row.href] = {
          title: row.title,
          href: row.href,
          isVisited: row.is_visited,
          isRelevant: row.is_relevant,
        };
      });
    }
  });

  const options = {
    uri: `${BASE_URL}b/Tools/N-5yc1vZc1xy`,
    transform: body => cheerio.load(body),
  };

  rp(options)
    .then(($) => {
      const links = [];
      const anchors = $('a');
      Object.values(anchors).forEach((link) => {
        if (link.attribs !== undefined && link.attribs.href.substring(0, 3).match('/[bpc]/')) {
          console.log(link);
          links.push({ href: link.attribs.href, title: link.attribs.title });
        }
      });
      res.send(links);
    })
    .catch((err) => {
      console.log(err);
    });
});

const PORT = process.env.PORT || '3000';
app.listen(PORT);

console.log(`Listening on port ${PORT}`);

module.exports = app;
