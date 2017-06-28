const express = require('express');
// const rp = require('request-promise');
// const cheerio = require('cheerio');
const knex = require('../db/connection');
const Link = require('../db/model/Link');
const Page = require('../db/model/Page');

const router = express.Router();

const BASE_URL = 'http://www.homedepot.com';

router.get('/scrape', (req, res) => {
  Link.getExistingLinksAsPromise().then((results) => {
    const existingLinks = {};
    let rows = results;
    if (!Array.isArray(rows)) { // deal with single returned row consistently
      rows = [rows];
    }
    rows.forEach((row) => {
      const link = new Link(row.href, row.title, row.is_visited, row.is_relevant);
      existingLinks[link.href] = link;
    });

    const url = '/b/Tools/N-5yc1vZc1xy?cm_sp=vanity-_-tools-_-MAY16?cm_sp=vanity-_-tools-_-MAY16';

    Page.getPageAsPromise(`${BASE_URL}${url}`).then(($) => {
      const linksToAdd = [];
      const anchors = $('a');
      let added = 0;
      let skipped = 0;

      Object.values(anchors).forEach((anchor) => {
        let a = anchor;
        if (a.attribs === undefined) {
          skipped += 1;
        } else if (!a.attribs.href.substring(0, 3).match('/[bpc]/')) {
          skipped += 1;
        } else if (existingLinks[a.attribs.href] !== undefined) {
          skipped += 1;
        } else {
          added += 1;

          const title = a.attribs.title || '';
          a = new Link(a.attribs.href, title);
          linksToAdd.push(a.insertToDatabaseAsPromise());
        }
      });

      Promise.all(linksToAdd).then(() => {
        res.send(`${added} links added to database. ${skipped} links skipped.`);
      })
      .catch((err) => {
        console.log(err);
      });
    })
    .catch((err) => {
      console.log(err);
    });
  });
});

router.get('/visit', (req, res) => {
  Link.getUnvisitedLinksAsPromise().then((rows) => {
    let links = rows;

    if (!Array.isArray(rows)) { // deal with single returned row consistently
      links = [rows];
    }

    const pagesToVisit = [];
    links.forEach((link) => {
      pagesToVisit.push(Page.getPageAsPromise(`${BASE_URL}${link.href}`));
    });

    Promise.all(pagesToVisit).then((results) => {
      const pagesToAdd = [];
      let body = '';
      results.forEach(($, idx) => {
        body = $.html();
        console.log(links[idx].href);
        pagesToAdd.push(knex('pages').insert({ url: links[idx].href, body }));
      });

      Promise.all(pagesToAdd).then((adds) => {
        const linksToUpdate = [];
        links.forEach((link) => {
          linksToUpdate.push(Link.updateInDatabaseAsPromise(`${BASE_URL}${link.href}`, true));
        });
        Promise.all(linksToUpdate).then((updates) => {
          res.send(`${adds.length} pages added to database. ${updates.length} links updated in database.`);
        });
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

module.exports = router;
