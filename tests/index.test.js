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
    // beforeEach(() => {
    //     return User.query().insertGraph({
    //         username: faker.internet.userName(),
    //         contact: [
    //             {
    //                 firstName: faker.name.firstName(),
    //                 lastName: faker.name.lastName(),
    //             },
    //         ],
    //     });
    // });

    // afterEach(() => {
    //     return knexConnection('JoinTable')
    //         .delete()
    //         .then(() => {
    //             return knexConnection('user').delete();
    //         })
    //         .then(() => {
    //             return knexConnection('RelatedObjects').delete();
    //         });
    // });

    describe('.deleteById()', () => {
        test('should only soft delete the record', async () => {
            const { User } = getModel();

            const createdUser = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            await User.query().deleteById(1);
            const user = await User.query().findById(createdUser.id);

            expect(user.deletedAt).toBeString();
        });
    });

    describe('.delete() or .del()', () => {
        test('should only soft delete the record', async () => {
            const { User } = getModel();

            const createdUser = await User.query().insertAndFetch({
                username: faker.internet.userName(),
            });

            await User.query().where('id', createdUser.id).delete();

            const user = await User.query().findById(createdUser.id);

            expect(user.deletedAt).toBeString();
        });
        // describe('when a columnName was not specified', () => {
        //   it('should set the "deleted" column to true for any matching records', () => {
        //     const TestObject = getModel();
        //     return TestObject.query(knex)
        //       .where('id', 1)
        //       .del()
        //       .then(() => {
        //         return TestObject.query(knex).where('id', 1).first();
        //       })
        //       .then((result) => {
        //         expect(result.deleted).to.equal(1, 'row not marked deleted');
        //       });
        //   });
        // });
        describe('when a columnName was specified', () => {
            it('should set that columnName to true for any matching records', async () => {
                const { User } = getModel({ columnName: 'deleted2' });
                const createdUser = await User.query().insertAndFetch({
                    username: faker.internet.userName(),
                });

                await User.query().where('id', createdUser.id).delete();

                const user = await User.query().findById(createdUser.id);
                console.log(user);
                // expect(user).toBeString();
            });
        });
        // describe('when used with .$query()', () => {
        //   it('should still mark the row deleted', () => {
        //     // not sure if this will work...
        //     const TestObject = getModel({ columnName: 'inactive' });
        //     return TestObject.query(knex)
        //       .where('id', 1)
        //       .first()
        //       .then((result) => {
        //         return result.$query(knex).del();
        //       })
        //       .then(() => {
        //         return TestObject.query(knex).where('id', 1).first();
        //       })
        //       .then((result) => {
        //         expect(result.inactive).to.equal(1, 'row not marked deleted');
        //       });
        //   });
        // });
        // describe('when deletedValue and nonDeletedValue are overridden', () => {
        //   before(() => {
        //     return createDeletedAtColumn(knex);
        //   });
        //   after(() => {
        //     return removeDeletedAtColumn(knex);
        //   });
        //   it('should set the "deleted" column to the set value', () => {
        //     const now = new Date();
        //     const TestObject = getModel(overriddenValues(knex));
        //     return TestObject.query(knex)
        //       .where('id', 1)
        //       .del()
        //       .then(() => {
        //         return TestObject.query(knex).where('id', 1).first();
        //       })
        //       .then((result) => {
        //         const deletedAt = new Date(result.deleted_at);
        //         expect(deletedAt).to.be.gt(now, 'row not marked deleted');
        //       });
        //   });
        // });
    });

    //   describe('.hardDelete()', () => {
    //     it('should remove the row from the database', () => {
    //       const TestObject = getModel({ columnName: 'inactive' });

    //       return TestObject.query(knex)
    //         .where('id', 1)
    //         .hardDelete()
    //         .then(() => {
    //           return TestObject.query(knex).where('id', 1).first();
    //         })
    //         .then((result) => {
    //           // eslint-disable-next-line
    //           expect(result).to.be.undefined;
    //         });
    //     });
    //     describe('when used with .$query()', () => {
    //       it('should remove the row from the database', () => {
    //         const TestObject = getModel({ columnName: 'inactive' });

    //         return TestObject.query(knex)
    //           .where('id', 1)
    //           .first()
    //           .then((result) => {
    //             return result.$query(knex).hardDelete();
    //           })
    //           .then(() => {
    //             return TestObject.query(knex).where('id', 1).first();
    //           })
    //           .then((result) => {
    //             // eslint-disable-next-line
    //             expect(result).to.be.undefined;
    //           });
    //       });
    //     });

    //     describe('when deletedValue and nonDeletedValue are overridden', () => {
    //       before(() => {
    //         return createDeletedAtColumn(knex);
    //       });
    //       after(() => {
    //         return removeDeletedAtColumn(knex);
    //       });

    //       it('should remove the row from the database', () => {
    //         const TestObject = getModel(overriddenValues(knex));

    //         return TestObject.query(knex)
    //           .where('id', 1)
    //           .hardDelete()
    //           .then(() => {
    //             return TestObject.query(knex).where('id', 1).first();
    //           })
    //           .then((result) => {
    //             // eslint-disable-next-line
    //             expect(result).to.be.undefined;
    //           });
    //       });
    //     });
    //   });

    //   describe('.undelete()', () => {
    //     it('should set the "undelete" flag in the queryContext of lifecycle functions', () => {
    //       const TestObject = getModel();

    //       // soft delete the row
    //       return TestObject.query(knex)
    //         .where('id', 1)
    //         .del()
    //         .then(() => {
    //           // now undelete the previously deleted row
    //           return TestObject.query(knex).where('id', 1).undelete();
    //         })
    //         .then(() => {
    //           expect(beforeUndelete).to.equal(true, 'before queryContext not set');
    //           expect(afterUndelete).to.equal(true, 'after queryContext not set');
    //         });
    //     });
    //     it('should set the configured delete column to false for any matching records', () => {
    //       const TestObject = getModel();

    //       // soft delete the row
    //       return TestObject.query(knex)
    //         .where('id', 1)
    //         .del()
    //         .then(() => {
    //           // now undelete the previously deleted row
    //           return TestObject.query(knex).where('id', 1).undelete();
    //         })
    //         .then(() => {
    //           // and verify
    //           return TestObject.query(knex).where('id', 1).first();
    //         })
    //         .then((result) => {
    //           expect(result.deleted).to.equal(0, 'row not undeleted');
    //         });
    //     });

    //     describe('when deletedValue and nonDeletedValue are overridden', () => {
    //       before(() => {
    //         return createDeletedAtColumn(knex);
    //       });
    //       after(() => {
    //         return removeDeletedAtColumn(knex);
    //       });

    //       it('should set the configured delete column to notDeletedValue for any matching records', () => {
    //         const TestObject = getModel(overriddenValues(knex));

    //         return TestObject.query(knex)
    //           .where('id', 1)
    //           .del()
    //           .then(() => {
    //             // now undelete the previously deleted row
    //             return TestObject.query(knex).where('id', 1).undelete();
    //           })
    //           .then(() => {
    //             // and verify
    //             return TestObject.query(knex).where('id', 1).first();
    //           })
    //           .then((result) => {
    //             expect(result.deleted_at).to.equal(null, 'row not undeleted');
    //           });
    //       });
    //     });

    //     describe('when used with .$query()', () => {
    //       it('should set the configured delete column to false for the matching record', () => {
    //         const TestObject = getModel();

    //         // soft delete the row
    //         return TestObject.query(knex)
    //           .where('id', 1)
    //           .del()
    //           .then(() => {
    //             // get the deleted row
    //             return TestObject.query(knex).where('id', 1).first();
    //           })
    //           .then((result) => {
    //             // undelete the row
    //             return result.$query(knex).undelete();
    //           })
    //           .then(() => {
    //             // and verify
    //             return TestObject.query(knex).where('id', 1).first();
    //           })
    //           .then((result) => {
    //             expect(result.deleted).to.equal(0, 'row not undeleted');
    //           });
    //       });
    //     });
    //   });

    //   describe('a normal update', () => {
    //     it('should not set any queryContext flags', () => {
    //       const TestObject = getModel();

    //       // soft delete the row
    //       return TestObject.query(knex)
    //         .where('id', 1)
    //         .patch({ name: 'edited name' })
    //         .then(() => {
    //           expect(beforeSoftDelete).to.equal(
    //             false,
    //             'before softDelete queryContext set incorrectly'
    //           );
    //           expect(afterSoftDelete).to.equal(
    //             false,
    //             'after softDelete queryContext set incorrectly'
    //           );
    //           expect(beforeUndelete).to.equal(
    //             false,
    //             'before undelete queryContext set incorrectly'
    //           );
    //           expect(afterUndelete).to.equal(
    //             false,
    //             'after undelete queryContext set incorrectly'
    //           );
    //         });
    //     });
    //   });

    //   describe('.whereNotDeleted()', () => {
    //     function whereNotDeletedRelationshipTest(TestObject) {
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
    //                 f.whereNotDeleted();
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
    //               2,
    //               'wrong result returned'
    //             );
    //           })
    //       );
    //     }

    //     it('should cause deleted rows to be filterd out of the main result set', () => {
    //       const TestObject = getModel();

    //       return TestObject.query(knex)
    //         .where('id', 1)
    //         .del()
    //         .then(() => {
    //           return TestObject.query(knex).whereNotDeleted();
    //         })
    //         .then((result) => {
    //           const anyDeletedExist = result.reduce((acc, obj) => {
    //             return acc || obj.deleted === 1;
    //           }, false);
    //           expect(anyDeletedExist).to.equal(
    //             false,
    //             'a deleted record was included in the result set'
    //           );
    //         });
    //     });
    //     it('should still work when a different columnName was specified', () => {
    //       const TestObject = getModel({ columnName: 'inactive' });

    //       return TestObject.query(knex)
    //         .where('id', 1)
    //         .del()
    //         .then(() => {
    //           return TestObject.query(knex).whereNotDeleted();
    //         })
    //         .then((result) => {
    //           const anyDeletedExist = result.reduce((acc, obj) => {
    //             return acc || obj.inactive === 1;
    //           }, false);
    //           expect(anyDeletedExist).to.equal(
    //             false,
    //             'a deleted record was included in the result set'
    //           );
    //         });
    //     });
    //     it('should work inside a relationship filter', () => {
    //       const TestObject = getModel();
    //       return whereNotDeletedRelationshipTest(TestObject);
    //     });

    //     describe('when deletedValue and nonDeletedValue are overridden', () => {
    //       before(() => {
    //         return createDeletedAtColumn(knex);
    //       });
    //       after(() => {
    //         return removeDeletedAtColumn(knex);
    //       });

    //       it('should cause deleted rows to be filtered out of the main result set', () => {
    //         const TestObject = getModel(overriddenValues(knex));

    //         return TestObject.query(knex)
    //           .where('id', 1)
    //           .del()
    //           .then(() => {
    //             return TestObject.query(knex).whereNotDeleted();
    //           })
    //           .then((result) => {
    //             const anyDeletedExist = result.reduce((acc, obj) => {
    //               return acc || obj.deleted_at !== null;
    //             }, false);
    //             expect(anyDeletedExist).to.equal(
    //               false,
    //               'a deleted record was included in the result set'
    //             );
    //           });
    //       });

    //       it('should work inside a relationship filter', () => {
    //         const TestObject = getModel(overriddenValues(knex));
    //         return whereNotDeletedRelationshipTest(TestObject);
    //       });
    //     });
    //   });

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
    //     it('should still work when a different columnName was specified', () => {
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
