import 'jest-extended';
import { faker } from '@faker-js/faker';
import databaseSetup from './database-setup.js';
import knexConnection from './config.js';
import getModel from './model/index.js';

beforeAll(() => {
    return databaseSetup.up();
});

afterAll(async () => {
    return databaseSetup.down();
});

describe('Soft Delete plugin tests', () => {
    afterEach(async () => {
        const { User } = getModel();

        await User.query().hardDelete();
    });

    describe('.deleteById()', () => {
        test('when nothing is specified', async () => {
            const { User } = getModel();

            const { id, deletedAt: deletedAtCreate } =
                await User.query().insertAndFetch({
                    username: faker.internet.userName(),
                });

            expect(deletedAtCreate).toBeNull();

            await User.query().deleteById(id);

            const { deletedAt } = await User.query().findById(id);

            expect(typeof deletedAt).toBe('string');
        });

        it('when a columnName is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'deletedDate',
                },
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            await User.query().deleteById(id);

            const user = await User.query().findById(id);

            expect(typeof user.deletedDate).toBe('string');
        });

        it('when a columnName and a deletedValue is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'active',
                    deletedValue: () => false,
                },
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            await User.query().deleteById(id);

            const user = await User.query().findById(id);
            expect(user.active).toBe(0);
        });

        it('when a deletedValue and a notDeletedValue is specified', async () => {
            const { User } = getModel({
                options: {
                    deletedValue: () => null,
                    notDeletedValue: () => new Date(),
                },
            });

            const createdUser = await User.query().insertAndFetch({
                username: faker.internet.userName(),
                // Reverse the behaviour
                deletedAt: new Date(),
            });

            expect(typeof createdUser.deletedAt).toBe('string');

            await User.query().deleteById(createdUser.id);

            const user = await User.query().findById(createdUser.id);
            expect(user.deletedAt).toBeNull();
        });
    });

    describe('.delete() or .del()', () => {
        test('when nothing is specified', async () => {
            const { User } = getModel();

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            await User.query().where('id', id).delete();

            const user = await User.query().findById(id);

            expect(typeof user.deletedAt).toBe('string');
        });

        it('when a columnName is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'deletedDate',
                },
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            await User.query().where('id', id).delete();

            const user = await User.query().findById(id);

            expect(typeof user.deletedDate).toBe('string');
        });

        it('when a columnName and a deletedValue is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'active',
                    deletedValue: () => false,
                },
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            await User.query().where('id', id).delete();

            const user = await User.query().findById(id);
            expect(user.active).toBe(0);
        });

        it('when a deletedValue and notDeletedValue is specified', async () => {
            const { User } = getModel({
                options: {
                    deletedValue: () => null,
                    notDeletedValue: () => new Date(),
                },
            });

            const createdUser = await User.query().insertAndFetch({
                username: faker.internet.userName(),
                // Reverse the behaviour
                deletedAt: new Date(),
            });

            expect(typeof createdUser.deletedAt).toBe('string');

            await User.query().where('id', createdUser.id).delete();

            const user = await User.query().findById(createdUser.id);
            expect(user.deletedAt).toBeNull();
        });
    });

    describe('.hardDelete()', () => {
        it('should delete the row from the database when nothing is specified', async () => {
            const { User } = getModel();

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            const amountOfDeletedRows = await User.query()
                .where('id', id)
                .hardDelete();
            expect(amountOfDeletedRows).toBeGreaterThan(0);

            const deletedRecord = await User.query().findById(id);
            expect(deletedRecord).toBeUndefined();
        });

        it('should delete the row when a columnName is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'deletedDate',
                },
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            const amountOfDeletedRows = await User.query()
                .where('id', id)
                .hardDelete();
            expect(amountOfDeletedRows).toBeGreaterThan(0);

            const deletedRecord = await User.query().findById(id);
            expect(deletedRecord).toBeUndefined();
        });

        it('should delete the row when a columnName and a deletedValue is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'active',
                    deletedValue: () => false,
                },
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            const amountOfDeletedRows = await User.query()
                .where('id', id)
                .hardDelete();
            expect(amountOfDeletedRows).toBeGreaterThan(0);

            const deletedRecord = await User.query().findById(id);
            expect(deletedRecord).toBeUndefined();
        });
    });

    describe('.undelete()', () => {
        it('should undelete the row from the database when nothing is specified', async () => {
            const { User } = getModel();

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
                deletedAt: new Date(),
            });

            await User.query().where('id', id).undelete();

            const user = await User.query().findById(id);
            expect(user.deletedAt).toBeNull();
        });

        it('should undelete the row when a columnName is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'deletedDate',
                },
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
                deletedDate: new Date(),
            });

            await User.query().where('id', id).undelete();

            const user = await User.query().findById(id);
            expect(user.deletedDate).toBeNull();
        });

        it('should undelete the row when a columnName and a deletedValue is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'active',
                    deletedValue: () => false,
                    notDeletedValue: () => true,
                },
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
                active: false,
            });

            await User.query().where('id', id).undelete();

            const user = await User.query().findById(id);
            expect(user.active).toBe(1);
        });
    });

    describe('.whereNotDeleted()', () => {
        it('should return only the non deleted records', async () => {
            const { User } = getModel();

            await User.knexQuery().insert([
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                    deletedAt: new Date(),
                },
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                    deletedAt: new Date(),
                },
            ]);

            const rows = await User.query().whereNotDeleted();
            const deletedRows = rows.filter((m) => m.deletedAt !== null);

            expect(rows.length).toBe(2);
            expect(deletedRows.length).toBe(0);
        });

        it('should return only the non deleted records when a different columnName is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'deletedDate',
                },
            });

            await User.knexQuery().insert([
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                    deletedDate: new Date(),
                },
            ]);

            const rows = await User.query().whereNotDeleted();
            const deletedRows = rows.filter((m) => m.deletedDate !== null);

            expect(rows.length).toBe(3);
            expect(deletedRows.length).toBe(0);
        });

        it('should return only the non deleted records when a different columnName and a deletedValue is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'active',
                    deletedValue: () => false,
                },
            });

            await User.knexQuery().insert([
                {
                    username: faker.internet.userName(),
                    active: false,
                },
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                    active: false,
                },
            ]);

            const rows = await User.query().whereNotDeleted();
            const deletedRows = rows.filter((m) => m.active === false);

            expect(rows.length).toBe(2);
            expect(deletedRows.length).toBe(0);
        });

        describe('filter option inside a relationship', () => {
            it('should return only the non deleted contacts', async () => {
                const { User } = getModel();

                await User.query().insertGraph([
                    {
                        username: faker.internet.userName(),
                        contactNonDeleted: [
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                        ],
                    },
                ]);

                const rows = await User.query().withGraphFetched(
                    'contactNonDeleted'
                );
                const deletedRows = rows[0].contactNonDeleted.filter(
                    (m) => m.deletedAt !== null
                );

                expect(rows[0].contactNonDeleted.length).toBe(2);
                expect(deletedRows.length).toBe(0);
            });

            it('should return only the not deleted contacts when the filter is directly used on the option withGraphFetched', async () => {
                const { User } = getModel();

                await User.query().insertGraph([
                    {
                        username: faker.internet.userName(),
                        contact: [
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                        ],
                    },
                ]);

                const rows = await User.query().withGraphFetched(
                    'contact(notDeleted)'
                );
                const deletedRows = rows[0].contact.filter(
                    (m) => m.deletedAt !== null
                );

                expect(rows[0].contact.length).toBe(2);
                expect(deletedRows.length).toBe(0);
            });

            it('should return only the not deleted contacts when the filter is directly used on the option withGraphJoined', async () => {
                const { User } = getModel();

                await User.query().insertGraph([
                    {
                        username: faker.internet.userName(),
                        contact: [
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                        ],
                    },
                ]);

                const rows = await User.query().withGraphJoined(
                    'contact(notDeleted)'
                );
                const deletedRows = rows[0].contact.filter(
                    (m) => m.deletedAt !== null
                );

                expect(rows[0].contact.length).toBe(2);
                expect(deletedRows.length).toBe(0);
            });

            it('should return only the non deleted records when a different columnName is specified', async () => {
                const { User } = getModel({
                    options: {
                        columnName: 'deletedDate',
                    },
                });

                await User.query().insertGraph([
                    {
                        username: faker.internet.userName(),
                        contactNonDeleted: [
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedDate: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedDate: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                        ],
                    },
                ]);

                const rows = await User.query().withGraphFetched(
                    'contactNonDeleted'
                );
                const deletedRows = rows[0].contactNonDeleted.filter(
                    (m) => m.deletedDate !== null
                );

                expect(rows[0].contactNonDeleted.length).toBe(2);
                expect(deletedRows.length).toBe(0);
            });

            it('should return only the non deleted records when a different columnName, deletedValue and nonDeletedValue are specified', async () => {
                const { User } = getModel({
                    options: {
                        columnName: 'active',
                        deletedValue: () => false,
                        notDeletedValue: () => true,
                    },
                });

                await User.query().insertGraph([
                    {
                        username: faker.internet.userName(),
                        contactNonDeleted: [
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                active: 0,
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                active: 1,
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                        ],
                    },
                ]);

                const rows = await User.query().withGraphFetched(
                    'contactNonDeleted'
                );
                const deletedRows = rows[0].contactNonDeleted.filter(
                    (m) => m.active === false
                );

                expect(rows[0].contactNonDeleted.length).toBe(3);
                expect(deletedRows.length).toBe(0);
            });

            it('should check if the filtering works when the relation name is different as the model name', async () => {
                const { User } = getModel({
                    options: {
                        columnName: 'deletedAt',
                    },
                });

                const userWithAnimals = [
                    {
                        username: faker.internet.userName(),
                        animals: [
                            {
                                name: faker.animal.dog(),
                                deletedAt: new Date(),
                            },
                            {
                                name: faker.animal.dog(),
                                deletedAt: null,
                            },
                        ],
                    },
                    {
                        username: faker.internet.userName(),
                        animals: [
                            {
                                name: faker.animal.bear(),
                                deletedAt: null,
                            },
                            {
                                name: faker.animal.dog(),
                                deletedAt: null,
                            },
                        ],
                    },
                    {
                        username: faker.internet.userName(),
                        animals: [
                            {
                                name: faker.animal.cat(),
                                deletedAt: new Date(),
                            },
                            {
                                name: faker.animal.dog(),
                                deletedAt: new Date(),
                            },
                        ],
                    },
                ];

                await User.query().insertGraph([
                    ...userWithAnimals,
                    {
                        username: faker.internet.userName(),
                        deletedAt: null,
                    },
                    {
                        username: faker.internet.userName(),
                        deletedAt: new Date(),
                    },
                    {
                        username: faker.internet.userName(),
                        deletedAt: null,
                    },
                ]);

                const rows = await User.query().whereExists(
                    User.relatedQuery('animals').whereNotDeleted()
                );

                const usersWithNonDeletedAnimals = userWithAnimals.filter(
                    (user) =>
                        user.animals.some((animal) => animal.deletedAt === null)
                );

                expect(rows.length).toBe(usersWithNonDeletedAnimals.length);
            });
        });
    });

    describe('.whereDeleted()', () => {
        it('should return only the deleted records', async () => {
            const { User } = getModel();

            await User.knexQuery().insert([
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                    deletedAt: new Date(),
                },
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                },
            ]);

            const rows = await User.query().whereDeleted();
            const deletedRows = rows.filter((m) => m.deletedAt === null);

            expect(rows.length).toBe(1);
            expect(deletedRows.length).toBe(0);
        });

        it('should return only the deleted records when a different columnName is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'deletedDate',
                },
            });

            await User.knexQuery().insert([
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                    deletedDate: new Date(),
                },
            ]);

            const rows = await User.query().whereDeleted();
            const deletedRows = rows.filter((m) => m.deletedDate === null);

            expect(rows.length).toBe(1);
            expect(deletedRows.length).toBe(0);
        });

        it('should return only the deleted records when a different columnName and a deletedValue is specified', async () => {
            const { User } = getModel({
                options: {
                    columnName: 'active',
                    deletedValue: () => false,
                },
            });

            await User.knexQuery().insert([
                {
                    username: faker.internet.userName(),
                    active: false,
                },
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                },
                {
                    username: faker.internet.userName(),
                    active: false,
                },
            ]);

            const rows = await User.query().whereDeleted();
            const deletedRows = rows.filter((m) => m.active === true);

            expect(rows.length).toBe(2);
            expect(deletedRows.length).toBe(0);
        });

        describe('filter option inside a relationship', () => {
            it('should return only the deleted contacts', async () => {
                const { User } = getModel();

                await User.query().insertGraph([
                    {
                        username: faker.internet.userName(),
                        contactDeleted: [
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                        ],
                    },
                ]);

                const rows = await User.query().withGraphFetched(
                    'contactDeleted'
                );
                const notDeletedRows = rows[0].contactDeleted.filter(
                    (m) => m.deletedAt === null
                );

                expect(rows[0].contactDeleted.length).toBe(2);
                expect(notDeletedRows.length).toBe(0);
            });

            it('should return only the deleted contacts when the filter is directly used on the option withGraphFetched', async () => {
                const { User } = getModel();

                await User.query().insertGraph([
                    {
                        username: faker.internet.userName(),
                        contact: [
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                        ],
                    },
                ]);

                const rows = await User.query().withGraphFetched(
                    'contact(deleted)'
                );
                const notDeletedRows = rows[0].contact.filter(
                    (m) => m.deletedAt === null
                );

                expect(rows[0].contact.length).toBe(2);
                expect(notDeletedRows.length).toBe(0);
            });

            it('should return only the deleted contacts when the filter is directly used on the option withGraphJoined', async () => {
                const { User } = getModel();

                await User.query().insertGraph([
                    {
                        username: faker.internet.userName(),
                        contact: [
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedAt: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                        ],
                    },
                ]);

                const rows = await User.query().withGraphJoined(
                    'contact(deleted)'
                );
                const deletedRows = rows[0].contact.filter(
                    (m) => m.deletedAt === null
                );

                expect(rows[0].contact.length).toBe(2);
                expect(deletedRows.length).toBe(0);
            });

            it('should return only the deleted records when a different columnName is specified', async () => {
                const { User } = getModel({
                    options: {
                        columnName: 'deletedDate',
                    },
                });

                await User.query().insertGraph([
                    {
                        username: faker.internet.userName(),
                        contactDeleted: [
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedDate: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                deletedDate: new Date(),
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                            },
                        ],
                    },
                ]);

                const rows = await User.query().withGraphFetched(
                    'contactDeleted'
                );
                const deletedRows = rows[0].contactDeleted.filter(
                    (m) => m.deletedDate === null
                );

                expect(rows[0].contactDeleted.length).toBe(2);
                expect(deletedRows.length).toBe(0);
            });

            it('should return only the deleted records when a different columnName, deletedValue and nonDeletedValue are specified', async () => {
                const { User } = getModel({
                    options: {
                        columnName: 'active',
                        deletedValue: () => false,
                        notDeletedValue: () => true,
                    },
                });

                await User.query().insertGraph([
                    {
                        username: faker.internet.userName(),
                        contactDeleted: [
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                active: 0,
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                active: 1,
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                active: 0,
                            },
                            {
                                firstName: faker.name.firstName(),
                                lastName: faker.name.lastName(),
                                active: 0,
                            },
                        ],
                    },
                ]);

                const rows = await User.query().withGraphFetched(
                    'contactDeleted'
                );

                const deletedRows = rows[0].contactDeleted.filter(
                    (m) => m.active === true
                );

                expect(rows[0].contactDeleted.length).toBe(3);
                expect(deletedRows.length).toBe(0);
            });
        });
    });

    describe('checks if the model has a soft delete property', () => {
        it('should set isSoftDelete property', async () => {
            const { User } = getModel();

            expect(User.isSoftDelete).toBe(true);
        });
    });

    describe('Lifecycle flags', () => {
        test('checks the soft delete flag before and after an update ', async () => {
            let beforeSoftDelete = false;
            let afterSoftDelete = false;

            const { User } = getModel({
                beforeUpdate(args, queryContext) {
                    if (queryContext.softDelete) {
                        beforeSoftDelete = true;
                    }
                },
                afterUpdate(args, queryContext) {
                    if (queryContext.softDelete) {
                        afterSoftDelete = true;
                    }
                },
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            await User.query().deleteById(id);

            expect(beforeSoftDelete).toBe(true);
            expect(afterSoftDelete).toBe(true);
        });

        test('checks the undelete flag before and after an update ', async () => {
            let beforeUndelete = false;
            let afterUndelete = false;

            const { User } = getModel({
                beforeUpdate(args, queryContext) {
                    if (queryContext.undelete) {
                        beforeUndelete = true;
                    }
                },
                afterUpdate(args, queryContext) {
                    if (queryContext.undelete) {
                        afterUndelete = true;
                    }
                },
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
                deletedAt: new Date(),
            });

            await User.query().where('id', id).undelete();

            expect(beforeUndelete).toBe(true);
            expect(afterUndelete).toBe(true);
        });
    });
});
