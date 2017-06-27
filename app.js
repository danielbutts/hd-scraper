const express = require('express');
const rp = require('request-promise');
const cheerio = require('cheerio');
const knex = require('./db/connection');

const app = express();

const BASE_URL = 'http://www.homedepot.com';

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
    } else {
      existingLinks[result.href] = {
        title: result.title,
        href: result.href,
        isVisited: result.is_visited,
        isRelevant: result.is_relevant,
      };
    }

    const options = {
      uri: `${BASE_URL}/b/Tools/N-5yc1vZc1xy`,
      transform: body => cheerio.load(body),
    };

    rp(options)
      .then(($) => {
        const linksToAdd = [];
        const anchors = $('a');
        let skipped = 0;
        let added = 0;
        Object.values(anchors).forEach((link) => {
          if (link.attribs === undefined) {
            // console.log('anchor has no attributes.');
            skipped += 1;
          } else if (!link.attribs.href.substring(0, 3).match('/[bpc]/')) {
            // console.log('ablsolute link ignored.');
            skipped += 1;
          } else if (existingLinks[link.attribs.href] !== undefined) {
            // console.log('link already exists.');
            skipped += 1;
          } else {
            // console.log('new link', link.attribs.href);
            added += 1;


            const title = link.attribs.title || '';
            linksToAdd.push(knex('links').insert({ href: link.attribs.href, title }));
          }
        });

        Promise.all(linksToAdd).then(() => {
          res.send(`${added} links added to database. ${skipped} links skipped.`);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  })
  .catch((err) => {
    console.log(err);
  });
});

app.get('/visit', (req, res) => {
  knex('links').where({ is_visited: false, is_relevant: true }).then((result) => {
    let existingLinks = [];
    if (Array.isArray(result)) {
      existingLinks = result;
    } else {
      existingLinks.push(result);
    }

    const linksToVisit = [];
    existingLinks.forEach((link) => {
      const options = {
        uri: `${BASE_URL}${link.href}`,
        transform: body => cheerio.load(body),
      };
      linksToVisit.push(rp(options));
    });

    Promise.all(linksToVisit).then((results) => {
      const pagesToAdd = [];
      let body = '';
      results.forEach(($, idx) => {
        body = $.html();
        console.log(existingLinks[idx].href);
        pagesToAdd.push(knex('pages').insert({ url: existingLinks[idx].href, body }));
      });

      Promise.all(pagesToAdd).then((adds) => {
        res.send(`${adds.length} pages added to database.`);
      });
    })
    .catch((err) => {
      console.log(err);
    });
  })
  .catch((err) => {
    console.log(err);
  });
});

const PORT = process.env.PORT || '3000';
app.listen(PORT);

console.log(`Listening on port ${PORT}`);

module.exports = app;
