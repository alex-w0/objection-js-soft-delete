import 'jest-extended';
import faker from 'faker';
import databaseSetup from './database-setup.js';
import knexConnection from './config.js';
import getModel from './model/index.js';

function createDeletedAtColumn(knex) {
    return knexConnection.schema.table('TestObjects', (table) => {
        table.timestamp('deleted_at');
    });
}

function removeDeletedAtColumn(knex) {
    return knexConnection.schema.table('TestObjects', (table) => {
        table.dropColumn('deleted_at');
    });
}

beforeAll(() => {
    return databaseSetup.up();
});

afterAll(async () => {
    return databaseSetup.down();
});

describe('Soft Delete plugin tests', () => {
    const startDate = new Date();

    afterEach(async () => {
        const { User } = getModel();

        await User.query().hardDelete();
    });

    describe('.deleteById()', () => {
        test('when nothing is specified', async () => {
            const { User } = getModel();

            const {
                id,
                deletedAt: deletedAtCreate,
            } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            expect(deletedAtCreate).toBeNull();

            await User.query().deleteById(id);

            const { deletedAt } = await User.query().findById(id);

            expect(deletedAt).toBeString();
        });

        it('when a columnName is specified', async () => {
            const { User } = getModel({
                columnName: 'deletedDate',
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            await User.query().deleteById(id);

            const user = await User.query().findById(id);

            expect(user.deletedDate).toBeString();
        });

        it('when a columnName and a deletedValue is specified', async () => {
            const { User } = getModel({
                columnName: 'active',
                deletedValue: false,
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
                deletedValue: null,
                notDeletedValue: new Date(),
            });

            const createdUser = await User.query().insertAndFetch({
                username: faker.internet.userName(),
                // Reverse the behaviour
                deletedAt: new Date(),
            });

            expect(createdUser.deletedAt).toBeString();

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

            expect(user.deletedAt).toBeString();
        });

        it('when a columnName is specified', async () => {
            const { User } = getModel({
                columnName: 'deletedDate',
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            await User.query().where('id', id).delete();

            const user = await User.query().findById(id);

            expect(user.deletedDate).toBeString();
        });

        it('when a columnName and a deletedValue is specified', async () => {
            const { User } = getModel({
                columnName: 'active',
                deletedValue: false,
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
                deletedValue: null,
                notDeletedValue: new Date(),
            });

            const createdUser = await User.query().insertAndFetch({
                username: faker.internet.userName(),
                // Reverse the behaviour
                deletedAt: new Date(),
            });

            expect(createdUser.deletedAt).toBeString();

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
                columnName: 'deletedDate',
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
                columnName: 'active',
                deletedValue: false,
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
                columnName: 'deletedDate',
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
                columnName: 'active',
                deletedValue: false,
            });

            const { id } = await User.query().insertAndFetch({
                username: faker.internet.userName(),
                active: false,
            });

            await User.query().where('id', id).undelete();

            const user = await User.query().findById(id);
            console.log(user);
            expect(user.active).toBe(true);
        });
    });

    describe('.whereNotDeleted()', () => {
        function whereNotDeletedRelationshipTest(TestObject) {
            // define the relationship to the TestObjects table
            const RelatedObject = class RelatedObject extends Model {
                static get tableName() {
                    return 'RelatedObjects';
                }

                static get relationMappings() {
                    return {
                        testObjects: {
                            relation: Model.ManyToManyRelation,
                            modelClass: TestObject,
                            join: {
                                from: 'RelatedObjects.id',
                                through: {
                                    from: 'JoinTable.relatedObjectId',
                                    to: 'JoinTable.testObjectId',
                                },
                                to: 'TestObjects.id',
                            },
                            filter: (f) => {
                                f.whereNotDeleted();
                            },
                        },
                    };
                }
            };

            return (
                TestObject.query(knex)
                    .where('id', 1)
                    // soft delete one test object
                    .del()
                    .then(() => {
                        return (
                            RelatedObject.query(knex)
                                .where('id', 1)
                                // use the predefined filter
                                .eager('testObjects')
                                .first()
                        );
                    })
                    .then((result) => {
                        expect(result.testObjects.length).to.equal(
                            1,
                            'eager returns not filtered properly'
                        );
                        expect(result.testObjects[0].id).to.equal(
                            2,
                            'wrong result returned'
                        );
                    })
            );
        }

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
            expect(deletedRows.length).toBe(1);
        });

        it('should return only the non deleted records when a different columnName is specified', async () => {
            const { User } = getModel({
                columnName: 'deletedDate',
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
                columnName: 'active',
                deletedValue: false,
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

        // it('should still work when a different columnName is specified', () => {
        //   const TestObject = getModel({ columnName: 'inactive' });

        //   return TestObject.query(knex)
        //     .where('id', 1)
        //     .del()
        //     .then(() => {
        //       return TestObject.query(knex).whereNotDeleted();
        //     })
        //     .then((result) => {
        //       const anyDeletedExist = result.reduce((acc, obj) => {
        //         return acc || obj.inactive === 1;
        //       }, false);
        //       expect(anyDeletedExist).to.equal(
        //         false,
        //         'a deleted record was included in the result set'
        //       );
        //     });
        // });
        // it('should work inside a relationship filter', () => {
        //   const TestObject = getModel();
        //   return whereNotDeletedRelationshipTest(TestObject);
        // });

        // describe('when deletedValue and nonDeletedValue are overridden', () => {
        //   before(() => {
        //     return createDeletedAtColumn(knex);
        //   });
        //   after(() => {
        //     return removeDeletedAtColumn(knex);
        //   });

        //   it('should cause deleted rows to be filtered out of the main result set', () => {
        //     const TestObject = getModel(overriddenValues(knex));

        //     return TestObject.query(knex)
        //       .where('id', 1)
        //       .del()
        //       .then(() => {
        //         return TestObject.query(knex).whereNotDeleted();
        //       })
        //       .then((result) => {
        //         const anyDeletedExist = result.reduce((acc, obj) => {
        //           return acc || obj.deleted_at !== null;
        //         }, false);
        //         expect(anyDeletedExist).to.equal(
        //           false,
        //           'a deleted record was included in the result set'
        //         );
        //       });
        //   });

        //   it('should work inside a relationship filter', () => {
        //     const TestObject = getModel(overriddenValues(knex));
        //     return whereNotDeletedRelationshipTest(TestObject);
        //   });
        // });
    });

    //   describe('.whereDeleted()', () => {
    //     function whereDeletedRelationhipTest(TestObject) {
    //       // define the relationship to the TestObjects table
    //       const RelatedObject = class RelatedObject extends Model {
    //         static get tableName() {
    //           return 'RelatedObjects';
    //         }

    //         static get relationMappings() {
    //           return {
    //             testObjects: {
    //               relation: Model.ManyToManyRelation,
    //               modelClass: TestObject,
    //               join: {
    //                 from: 'RelatedObjects.id',
    //                 through: {
    //                   from: 'JoinTable.relatedObjectId',
    //                   to: 'JoinTable.testObjectId',
    //                 },
    //                 to: 'TestObjects.id',
    //               },
    //               filter: (f) => {
    //                 f.whereDeleted();
    //               },
    //             },
    //           };
    //         }
    //       };

    //       return (
    //         TestObject.query(knex)
    //           .where('id', 1)
    //           // soft delete one test object
    //           .del()
    //           .then(() => {
    //             return (
    //               RelatedObject.query(knex)
    //                 .where('id', 1)
    //                 // use the predefined filter
    //                 .eager('testObjects')
    //                 .first()
    //             );
    //           })
    //           .then((result) => {
    //             expect(result.testObjects.length).to.equal(
    //               1,
    //               'eager returns not filtered properly'
    //             );
    //             expect(result.testObjects[0].id).to.equal(
    //               1,
    //               'wrong result returned'
    //             );
    //           })
    //       );
    //     }

    //     it('should cause only deleted rows to appear in the result set', () => {
    //       const TestObject = getModel();

    //       return TestObject.query(knex)
    //         .where('id', 1)
    //         .del()
    //         .then(() => {
    //           return TestObject.query(knex).whereDeleted();
    //         })
    //         .then((result) => {
    //           const allDeleted = result.reduce((acc, obj) => {
    //             return acc && obj.deleted === 1;
    //           }, true);
    //           expect(allDeleted).to.equal(
    //             true,
    //             'an undeleted record was included in the result set'
    //           );
    //         });
    //     });
    //     it('should still work when a different columnName is specified', () => {
    //       const TestObject = getModel({ columnName: 'inactive' });

    //       return TestObject.query(knex)
    //         .where('id', 1)
    //         .del()
    //         .then(() => {
    //           return TestObject.query(knex).whereDeleted();
    //         })
    //         .then((result) => {
    //           const allDeleted = result.reduce((acc, obj) => {
    //             return acc && obj.inactive === 1;
    //           }, true);
    //           expect(allDeleted).to.equal(
    //             true,
    //             'an undeleted record was included in the result set'
    //           );
    //         });
    //     });
    //     it('should work inside a relationship filter', () => {
    //       const TestObject = getModel();
    //       return whereDeletedRelationhipTest(TestObject);
    //     });

    //     describe('when deletedValue and nonDeletedValue are overridden', () => {
    //       before(() => {
    //         return createDeletedAtColumn(knex);
    //       });
    //       after(() => {
    //         return removeDeletedAtColumn(knex);
    //       });

    //       it('should cause only deleted rows to appear in the result set', () => {
    //         const TestObject = getModel(overriddenValues(knex));

    //         return TestObject.query(knex)
    //           .where('id', 1)
    //           .del()
    //           .then(() => {
    //             return TestObject.query(knex).whereDeleted();
    //           })
    //           .then((result) => {
    //             const allDeleted = result.reduce((acc, obj) => {
    //               return acc && obj.deleted !== null;
    //             }, true);
    //             expect(allDeleted).to.equal(
    //               true,
    //               'an undeleted record was included in the result set'
    //             );
    //           });
    //       });

    //       it('should work inside a relationship filter', () => {
    //         const TestObject = getModel(overriddenValues(knex));
    //         return whereDeletedRelationhipTest(TestObject);
    //       });
    //     });
    //   });

    //   describe('the notDeleted filter', () => {
    //     function notDeletedFilterTest(TestObject) {
    //       // define the relationship to the TestObjects table
    //       const RelatedObject = class RelatedObject extends Model {
    //         static get tableName() {
    //           return 'RelatedObjects';
    //         }

    //         static get relationMappings() {
    //           return {
    //             testObjects: {
    //               relation: Model.ManyToManyRelation,
    //               modelClass: TestObject,
    //               join: {
    //                 from: 'RelatedObjects.id',
    //                 through: {
    //                   from: 'JoinTable.relatedObjectId',
    //                   to: 'JoinTable.testObjectId',
    //                 },
    //                 to: 'TestObjects.id',
    //               },
    //             },
    //           };
    //         }
    //       };

    //       return (
    //         TestObject.query(knex)
    //           .where('id', 1)
    //           // soft delete one test object
    //           .del()
    //           .then(() => {
    //             return (
    //               RelatedObject.query(knex)
    //                 .where('id', 1)
    //                 // use the predefined filter
    //                 .eager('testObjects(notDeleted)')
    //                 .first()
    //             );
    //           })
    //           .then((result) => {
    //             expect(result.testObjects.length).to.equal(
    //               1,
    //               'eager returns not filtered properly'
    //             );
    //             expect(result.testObjects[0].id).to.equal(
    //               2,
    //               'wrong result returned'
    //             );
    //           })
    //       );
    //     }

    //     it('should exclude any records that have been flagged on the configured column when used in a .eager() function call', () => {
    //       const TestObject = getModel();
    //       return notDeletedFilterTest(TestObject);
    //     });

    //     describe('when deletedValue and nonDeletedValue are overridden', () => {
    //       before(() => {
    //         return createDeletedAtColumn(knex);
    //       });
    //       after(() => {
    //         return removeDeletedAtColumn(knex);
    //       });

    //       it('should exclude any records that have been flagged on the configured column when used in a .eager() function call', () => {
    //         const TestObject = getModel(overriddenValues(knex));
    //         return notDeletedFilterTest(TestObject);
    //       });
    //     });
    //   });
    //   describe('the deleted filter', () => {
    //     function deletedFilterTest(TestObject) {
    //       // define the relationship to the TestObjects table
    //       const RelatedObject = class RelatedObject extends Model {
    //         static get tableName() {
    //           return 'RelatedObjects';
    //         }

    //         static get relationMappings() {
    //           return {
    //             testObjects: {
    //               relation: Model.ManyToManyRelation,
    //               modelClass: TestObject,
    //               join: {
    //                 from: 'RelatedObjects.id',
    //                 through: {
    //                   from: 'JoinTable.relatedObjectId',
    //                   to: 'JoinTable.testObjectId',
    //                 },
    //                 to: 'TestObjects.id',
    //               },
    //             },
    //           };
    //         }
    //       };

    //       return (
    //         TestObject.query(knex)
    //           .where('id', 1)
    //           // soft delete one test object
    //           .del()
    //           .then(() => {
    //             return (
    //               RelatedObject.query(knex)
    //                 .where('id', 1)
    //                 // use the predefined filter
    //                 .eager('testObjects(deleted)')
    //                 .first()
    //             );
    //           })
    //           .then((result) => {
    //             expect(result.testObjects.length).to.equal(
    //               1,
    //               'eager returns not filtered properly'
    //             );
    //             expect(result.testObjects[0].id).to.equal(
    //               1,
    //               'wrong result returned'
    //             );
    //           })
    //       );
    //     }

    //     it('should only include any records that have been flagged on the configured column when used in a .eager() function call', () => {
    //       const TestObject = getModel();
    //       return deletedFilterTest(TestObject);
    //     });

    //     describe('when deletedValue and nonDeletedValue are overridden', () => {
    //       before(() => {
    //         return createDeletedAtColumn(knex);
    //       });
    //       after(() => {
    //         return removeDeletedAtColumn(knex);
    //       });

    //       it('should only include any records that have been flagged on the configured column when used in a .eager() function call', () => {
    //         const TestObject = getModel(overriddenValues(knex));
    //         return deletedFilterTest(TestObject);
    //       });
    //     });
    //   });

    //   describe('models with different columnNames', () => {
    //     it('should use the correct columnName for each model', () => {
    //       const TestObject = getModel({ columnName: 'inactive' });

    //       // define the relationship to the TestObjects table
    //       const RelatedObject = class RelatedObject extends sutFactory()(Model) {
    //         static get tableName() {
    //           return 'RelatedObjects';
    //         }

    //         static get relationMappings() {
    //           return {
    //             testObjects: {
    //               relation: Model.ManyToManyRelation,
    //               modelClass: TestObject,
    //               join: {
    //                 from: 'RelatedObjects.id',
    //                 through: {
    //                   from: 'JoinTable.relatedObjectId',
    //                   to: 'JoinTable.testObjectId',
    //                 },
    //                 to: 'TestObjects.id',
    //               },
    //             },
    //           };
    //         }
    //       };

    //       return TestObject.query(knex)
    //         .where('id', 1)
    //         .del()
    //         .then(() => {
    //           return RelatedObject.query(knex)
    //             .whereNotDeleted()
    //             .eager('testObjects(notDeleted)');
    //         })
    //         .then((result) => {
    //           expect(result[0].deleted).to.equal(
    //             0,
    //             'deleted row included in base result'
    //           );
    //           expect(result[0].testObjects.length).to.equal(
    //             1,
    //             'wrong number of eager relations loaded'
    //           );
    //           expect(result[0].testObjects[0].inactive).to.equal(
    //             0,
    //             'deleted row included in eager relations'
    //           );
    //         });
    //     });
    //   });

    // //   describe('soft delete indicator', () => {
    //     it('should set isSoftDelete property', () => {
    //       // eslint-disable-next-line no-unused-expressions
    //       expect(getModel().isSoftDelete).to.be.true;
    //     });
    //   });
});
