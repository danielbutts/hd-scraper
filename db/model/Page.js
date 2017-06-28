const rp = require('request-promise');
const cheerio = require('cheerio');
const knex = require('../connection');

class Page {
  constructor(url, html, id, isParsed, hasSKU) {
    this.url = url;
    this.html = html;
    this.id = id;
    this.isParsed = isParsed;
    this.hasSKU = hasSKU;
  }

  parseLinks() {
    const $ = cheerio.load(this.html);
    let links = $('a');
    return links;
  }
  
  saveToDatabaseAsPromise() {
    return knex('pages').insert({
      url: this.url,
      html: this.html,
      is_parsed: this.isParsed,
      has_sku: this.hasSKU
    }).returning('*');
  }
  
  static updateAsPromise(id, isVisited) {
    return knex('pages').update({ is_parsed: this.isParsed, has_sku: this.hasSKU }).where({ id });    
  }
  
  static getExistingPagesAsPromise() {
    return knex('pages');    
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

}

module.exports = Page;
