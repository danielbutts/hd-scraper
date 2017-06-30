const express = require('express');
const Link = require('../db/model/Link');
const Page = require('../db/model/Page');

const router = express.Router();

router.get('/', (req, res) => {
  const unvisited = req.query.unvisited;
  Link.getLinksAsPromise(unvisited).then((links) => {
    res.json(links);
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
    Link.getLinkAsPromise(id).then((links) => {
      res.json(links[0]);
    })
    .catch((err) => {
      console.log(err);
    });
  }
});

router.post('/', (req, res) => {
  if (req.body === undefined) {
    res.status(400).json({ error: 'Request lacks required body.' });
  } else if (req.body.href === undefined) {
    res.status(400).json({ error: 'Missing required field \'href\'.' });
  } else {
    const newLink = new Link(req.body.href, req.body.title);
    Link.getExistingLinksAsPromise().then((links) => {
      let isDuplicate = false;
      for (let i = 0; i < links.length; i += 1) {
        if (links[i].href === newLink.href) {
          res.status(400).json({ error: 'Duplicate link already exists.' });
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        newLink.insertToDatabaseAsPromise().then((inserts) => {
          res.status(200).json(inserts[0]);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }
});

router.post('/:id/visit', (req, res) => {
  const id = req.params.id;
  if (id === undefined) {
    res.status(400).json({ error: 'Missing required parameter \'id\'.' });
  } else {
    Link.getLinkAsPromise(id).then((links) => {
      if (links.length === 0) {
        res.status(400).json({ error: `Link with id '${id}' not found.` });
      } else {
        const link = new Link(links[0].href,
          links[0].title,
          links[0].is_visited,
          links[0].is_relevant,
          links[0].id);
        if (link.iVisited) {
          res.status(400).json({ error: `Link with id '${id}' has already been visited.` });
        } else {
          Page.getPageAsPromise(`${process.env.BASE_URL}${link.href}`).then((result) => {
            const page = new Page(link.href, result.html());
            const queries = [];
            queries.push(page.savePageAsPromise());
            queries.push(link.updateVisitedAsPromise(true));
            Promise.all(queries).then((upserts) => {
              res.status(200).json(upserts[0]);
            });
          })
          .catch((err) => {
            console.log(err);
          });
        }
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }
});

router.post('/visit/:count', (req, res) => {
  let count = req.params.count;
  if (count === undefined) {
    res.status(400).json({ error: 'Missing required parameter \'count\'.' });
  } else if (typeof count !== 'number' && count <= 0) {
    res.status(400).json({ error: 'Invalid value for parameter \'count\'.' });
  } else {
    Link.getUnvisitedLinksAsPromise().then((links) => {
      if (links.length === 0) {
        res.status(400).json({ error: 'No links found.' });
      } else {
        count = Math.min(count, links.length);
        const visitedLinks = [];
        const pagesToVisit = [];
        for (let i = 0; i < count; i += 1) {
          const link = new Link(links[i].href,
            links[i].title,
            links[i].is_visited,
            links[i].is_relevant,
            links[i].id);
          visitedLinks.push(link);
          pagesToVisit.push(Page.getPageAsPromise(`${process.env.BASE_URL}${link.href}`));
        }

        Promise.all(pagesToVisit).then((results) => {
          const queries = [];

          results.forEach((newPage, index) => {
            const page = new Page(visitedLinks[index].href, newPage.html());
            queries.push(page.savePageAsPromise());
            queries.push(visitedLinks[index].updateVisitedAsPromise(true));
            console.log('UPDATING VISITED LINK', visitedLinks[index], index);
          });

          Promise.all(queries).then((upserts) => {
            const inserts = [];
            upserts.forEach((el, index) => {
              if (index % 2 === 0) {
                inserts.push(el);
              }
            });
            res.status(200).json(inserts);
          });
        })
        .catch((err) => {
          console.log(err);
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
  }
});

module.exports = router;
