import { Model } from 'objection';
import softDelete from '../../src/softDelete.js';

export default function (options) {
    class BaseModel extends softDelete(options)(Model) {
        static get modelPaths() {
            return [__dirname];
        }
    }

    class User extends BaseModel {
        static get tableName() {
            return 'user';
        }

        static get relationMappings() {
            return {
                contact: {
                    relation: Model.HasOneThroughRelation,
                    modelClass: 'Contact',
                    join: {
                        from: 'user.id',
                        through: {
                            from: 'user_contact.user_id',
                            to: 'user_contact.contact_id',
                        },
                        to: 'contact.id',
                    },
                },
            };
        }
    }

    class Contact extends BaseModel {
        static get tableName() {
            return 'contact';
        }

        static get relationMappings() {
            return {
                user: {
                    relation: Model.HasOneThroughRelation,
                    modelClass: 'User',
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
    }

    return {
        User,
        Contact,
    };
}
