// const rp = require('request-promise');
const cheerio = require('cheerio');
const knex = require('../connection');

class Link {
  constructor(href, title) {
    this.href = href;
    this.title = title;
    this.isVisited = false;
    this.isRelevant = true;
  }

  insertToDatabaseAsPromise() {
    return knex('links').insert({ href: this.href, title: this.title });
  }

  static updateInDatabaseAsPromise(href, isVisited) {
    return knex('links').update({ is_visited: isVisited }).where({ href });    
  }
  
  static getExistingLinksAsPromise() {
    return knex('links');
  }
  
  static getUnvisitedLinksAsPromise() {
    return knex('links').where({ is_visited: false, is_relevant: true });
  }
  
  static getLinkByUrlAsPromise(url) {
    return knex('links').where({ href: url });  
  }

}

module.exports = Link;
