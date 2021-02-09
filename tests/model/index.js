import { Model } from 'objection';
import softDelete from '../../src/softDelete.js';
import initUser from './User.js';
import initContact from './Contact.js';

export default ({ options, beforeUpdate, afterUpdate } = {}) => {
    class BaseModel extends softDelete(options)(Model) {
        async $beforeUpdate(opt, queryContext) {
            await super.$beforeUpdate(opt, queryContext);
            // Callback for custom logic
            if (beforeUpdate) {
                beforeUpdate(opt, queryContext);
            }
        }

        async $afterUpdate(opt, queryContext) {
            await super.$afterUpdate(opt, queryContext);
            // Callback for custom logic
            if (afterUpdate) {
                afterUpdate(opt, queryContext);
            }
        }
    }

    return {
        User: initUser(BaseModel),
        Contact: initContact(BaseModel),
    };
};
