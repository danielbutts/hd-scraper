const rp = require('request-promise');
const cheerio = require('cheerio');
const knex = require('../connection');

class Page {
  constructor(url, html) {
    this.url = url;
    this.html = html;
  }

  saveToDatabaseAsPromise() {
    return knex('pages').insert({ url: this.url, html: this.html });
  }
  
  static getPageFromDataBaseAsPromise(url) {
    return knex('pages').where({ url });
  }

  static getPageAsPromise(url) {
    const options = {
      uri: url,
      transform: body => cheerio.load(body),
    };
    
    return rp(options);
  }
  
  parseLinks() {
    const $ = cheerio.load(this.html);
    let links = $('a');
    return links;
  }

}

module.exports = Page;
