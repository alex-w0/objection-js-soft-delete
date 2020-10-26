import { Model } from 'objection';

export default function (BaseModel) {
    const contact = class Contact extends BaseModel {
        static get tableName() {
            return 'contact';
        }

        static get relationMappings() {
            const initUser = require('./User');

            const User = initUser.default(BaseModel);

            return {
                user: {
                    relation: Model.ManyToManyRelation,
                    modelClass: User,
                    join: {
                        from: 'contact.id',
                        through: {
                            from: 'user_contact.contact_id',
                            to: 'user_contact.user_id',
                        },
                        to: 'user.id',
                    },
                },
            };
        }
    };

    return contact;
}
