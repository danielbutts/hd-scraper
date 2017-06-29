# Home Depot Product Web Scraper


### Add Initial Link
curl -i -X POST -H 'Content-Type: application/json' -d '{"href":"/"}' http://localhost:3000/links

### Visit Initial Page
curl -i -X POST -H 'Content-Type: application/json' http://localhost:3000/links/1

### Parse Initial Page
