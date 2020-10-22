import knex from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';
import path from 'path';

const knexConnection = knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: path.join(__dirname, './test.db'),
    },
    ...knexSnakeCaseMappers(),
});

// Give the knex instance to objection.
Model.knex(knexConnection);

export default knexConnection;
