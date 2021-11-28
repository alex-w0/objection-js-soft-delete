import { Model } from 'objection';

export default function (BaseModel) {
    const user = class User extends BaseModel {
        static get tableName() {
            return 'user';
        }

        static get relationMappings() {
            const initContact = require('./Contact');
            const initAnimal = require('./Animal');

            const Contact = initContact.default(BaseModel);
            const Animal = initAnimal.default(BaseModel);

            const contactRelationShip = {
                relation: Model.ManyToManyRelation,
                modelClass: Contact,
                join: {
                    from: 'user.id',
                    through: {
                        from: 'user_contact.user_id',
                        to: 'user_contact.contact_id',
                    },
                    to: 'contact.id',
                },
            };

            return {
                contact: contactRelationShip,
                animals: {
                    relation: Model.HasManyRelation,
                    modelClass: Animal,
                    join: {
                        from: 'user.id',
                        to: 'animal.userId',
                    },
                    filter: (f) => f.whereNotDeleted(),
                },
                // Create the same relationship with filter for testing purposes
                contactNonDeleted: {
                    ...contactRelationShip,
                    filter: (f) => f.whereNotDeleted(),
                },
                contactDeleted: {
                    ...contactRelationShip,
                    filter: (f) => f.whereDeleted(),
                },
            };
        }
    };

    return user;
}
