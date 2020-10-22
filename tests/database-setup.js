import knexConnection from './config.js';

function up() {
    return knexConnection.schema
        .createTable('user', (table) => {
            table.increments('id').primary();
            table.string('username');
            table.boolean('active').defaultTo(true);
            table.timestamp('deleted_date').defaultTo(null);
            table.timestamp('deleted_at').defaultTo(null);
        })
        .createTable('contact', (table) => {
            table.increments('id').primary();
            table.string('first_name');
            table.string('last_name');
            table.boolean('active').defaultTo(true);
            table.timestamp('deleted_date').defaultTo(null);
            table.timestamp('deleted_at').defaultTo(null);
        })
        .createTable('user_contact', (table) => {
            table.increments('id').primary();
            table.boolean('active').defaultTo(true);
            table.timestamp('deleted_date').defaultTo(null);
            table.timestamp('deleted_at').defaultTo(null);

            table.integer('user_id').unsigned().notNullable();
            table.integer('contact_id').unsigned().notNullable();

            // Foreign keys
            table
                .foreign('contact_id')
                .references('id')
                .inTable('contact')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
            table
                .foreign('user_id')
                .references('id')
                .inTable('user')
                .onUpdate('CASCADE')
                .onDelete('CASCADE');
        });
}

async function down() {
    await knexConnection.schema
        .dropTable('user')
        .dropTable('contact')
        .dropTable('user_contact');

    return knexConnection.destroy();
}

export default {
    up,
    down,
};
