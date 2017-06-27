const environment = process.env.NODE_ENV || 'development';
const knexConfig = require( '../knexfile' )[ environment ];
const connection = require( 'knex' )( knexConfig );

module.exports = connection;
