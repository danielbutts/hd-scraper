
exports.up = function(knex, Promise) {
  return knex.schema.table('pages', function (table) {
    table.boolean('is_parsed').notNullable().default(false);
    table.boolean('has_sku').notNullable().default(false);
    table.renameColumn('body', 'html');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('pages', function (table) {
    table.dropColumn('is_parsed');
    table.dropColumn('has_sku');
    table.renameColumn('html', 'body');
  });
};
