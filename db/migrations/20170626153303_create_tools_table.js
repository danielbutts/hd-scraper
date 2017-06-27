
exports.up = function(knex, Promise) {
  return knex.schema.createTable('tools', (table) => {
    table.increments();
    table.string('name').notNullable();
    table.string('brand').notNullable();
    table.text('description').notNullable();
    table.boolean('visited').notNullable().default(false);
    table.timestamps(true, true);
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('tools')
};
