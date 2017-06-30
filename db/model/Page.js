const rp = require('request-promise');
const cheerio = require('cheerio');
const knex = require('../connection');
const Link = require('./Link');

class Page {
  constructor(url, html, id, isParsed, hasSKU) {
    this.url = url;
    this.html = html;
    this.id = id;
    this.isParsed = isParsed || false;
    this.hasSKU = hasSKU || false;
  }

  parseLinksFromPage() {
    const links = [];
    const $ = cheerio.load(this.html);
    const anchors = $('a');
    Object.values(anchors).forEach((anchor) => {
      if (anchor.attribs !== undefined && 
        anchor.attribs.href !== undefined && 
        anchor.attribs.href.substring(0, 3).match('/[bpc]/')) {
        let link = new Link(anchor.attribs.href, anchor.attribs.title);
        links.push(link);
      }
    });
    return links;
  }
  
  savePageAsPromise() {
    return knex('pages').insert({
      url: this.url,
      html: this.html,
      is_parsed: this.isParsed,
      has_sku: this.hasSKU
    }).returning('*');
  }
  
  updatePageAsPromise() {
    console.log('id', this.id,'is_parsed', this.isParsed, 'has_sku', this.hasSKU);
    return knex('pages').update({ is_parsed: this.isParsed, has_sku: this.hasSKU }).where({ id: this.id }).returning('*');    
  }
  
  static loadPagesAsPromise(unparsed) {
    let query = knex('pages');
    if (unparsed) {
      query = query.where({ is_parsed: false });
    }
    return query;    
  }
  
  static loadPageAsPromise(id) {
    return knex('pages').where({ id });
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
