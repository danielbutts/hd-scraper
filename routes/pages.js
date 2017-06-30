const express = require('express');
const Page = require('../db/model/Page');

const router = express.Router();

router.get('/', (req, res) => {
  const unparsed = req.query.unparsed;
  Page.loadPagesAsPromise(unparsed).then((results) => {
    results.forEach((result) => {
      const page = result;
      delete page.html;
    });
    res.json(results);
  })
  .catch((err) => {
    console.log(err);
  });
});

router.get('/:id', (req, res) => {
  const id = req.params.id;
  if (id === undefined) {
    res.status(400).json({ error: 'Missing required parameter \'id\'.' });
  } else {
    Page.loadPageAsPromise(id).then((pages) => {
      if (pages.length === 0) {
        res.status(400).json({ error: `Page with id '${id}' not found.` });
      } else {
        res.json(pages[0]);
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }
});

router.post('/:id/parse', (req, res) => {
  const id = req.params.id;
  if (id === undefined) {
    res.status(400).json({ error: 'Missing required parameter \'id\'.' });
  } else {
    Page.loadPageAsPromise(id).then((results) => {
      const result = results[0];
      const page = new Page(result.url, result.html, result.id, result.is_parsed, result.has_sku);
      if (page.isParsed) {
        res.status(400).json({ error: `Page with id '${id}' has already been parsed.` });
      } else {
        const links = page.parseLinksFromPage();
        const queries = [];
        links.forEach((link) => {
          queries.push(link.insertToDatabaseAsPromise());
        });
        page.isParsed = true;
        queries.push(page.updatePageAsPromise());
        Promise.all(queries).then((inserts) => {
          res.json(inserts);
        });
      }
    });
  }
});

module.exports = router;
