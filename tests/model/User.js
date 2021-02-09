import { Model } from 'objection';

export default (BaseModel) => {
    const user = class User extends BaseModel {
        static get tableName() {
            return 'user';
        }

        static get relationMappings() {
            // eslint-disable-next-line global-require
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
};
