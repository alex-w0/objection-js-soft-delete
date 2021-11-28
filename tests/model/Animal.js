import { Model } from 'objection';

export default function (BaseModel) {
    const animal = class Animal extends BaseModel {
        static get tableName() {
            return 'animal';
        }

        static get relationMappings() {
            const initUser = require('./User');

            const User = initUser.default(BaseModel);

            return {
                owner: {
                    relation: Model.BelongsToOneRelation,
                    modelClass: User,
                    join: {
                        from: 'animal.user_id',
                        to: 'user.id',
                    },
                },
            };
        }
    };

    return animal;
}
