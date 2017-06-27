
exports.up = function(knex, Promise) {
  return knex.schema.createTable('links', (table) => {
    table.increments();
    table.string('title');
    table.text('href').notNullable();
    table.boolean('is_relevant').notNullable().default(true);
    table.boolean('is_visited').notNullable().default(false);
    table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('links')
};
