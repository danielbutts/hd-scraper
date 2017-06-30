// const rp = require('request-promise');
const cheerio = require('cheerio');
const knex = require('../connection');

class Link {
  constructor(href, title, isVisited, isRelevant, id) {
    this.href = href;
    this.title = title;
    this.isVisited = false;
    this.isRelevant = true;
    this.id = id;
  }

  insertToDatabaseAsPromise() {
    return knex('links').insert({ href: this.href, title: this.title });
  }

  updateVisitedAsPromise(isVisited) {
    return knex('links').update({ is_visited: isVisited }).where({ id: this.id });    
  }
  
  static getLinksAsPromise(unvisited) {
    let query = knex('links');
    if (unvisited) {
      query = query.where({ is_visited: false });
    }
    return query;    
  }
  
  static getUnvisitedLinksAsPromise() {
    return knex('links').where({ is_visited: false, is_relevant: true });
  }
  
  static getLinkAsPromise(id) {
    return knex('links').where({ id });
  }
  
  static getLinkByUrlAsPromise(url) {
    return knex('links').where({ href: url });  
  }

}

module.exports = Link;
