
exports.up = function(knex, Promise) {
  return knex.schema.createTable('pages', (table) => {
    table.increments();
    table.text('url').notNullable();
    table.text('body').notNullable();
    table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('pages')
};
