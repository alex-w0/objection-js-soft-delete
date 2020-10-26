import { Model } from 'objection';

export default function (BaseModel) {
    const user = class User extends BaseModel {
        static get tableName() {
            return 'user';
        }

        static get relationMappings() {
            const initContact = require('./Contact');

            const Contact = initContact.default(BaseModel);

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
                // Create the same relationship with filter for testing purposes
                contactWithFilter: {
                    ...contactRelationShip,
                    filter: (f) => f.whereNotDeleted(),
                },
            };
        }
    };

    return user;
}
