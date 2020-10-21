import knex from 'knex';
import { Model, knexSnakeCaseMappers } from 'objection';

const knexConnection = knex({
    client: 'sqlite3',
    useNullAsDefault: true,
    connection: {
        filename: './test.db',
    },
    ...knexSnakeCaseMappers(),
});

// Give the knex instance to objection.
Model.knex(knexConnection);

export default knexConnection;
