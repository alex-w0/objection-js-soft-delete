import { Model } from 'objection';
import softDelete from '../../src/softDelete.js';
import initUser from './User';
import initContact from './Contact';

export default function (options) {
    class BaseModel extends softDelete(options)(Model) {}

    return {
        User: initUser(BaseModel),
        Contact: initContact(BaseModel),
    };
}
