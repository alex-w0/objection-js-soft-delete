declare module 'objection-js-soft-delete' {
import { Model, QueryBuilder } from 'objection';

class SDQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<M, R> {
    ArrayQueryBuilderType!: SDQueryBuilder<M>;

    NumberQueryBuilderType!: SDQueryBuilder<M, number>;

    delete(): this['NumberQueryBuilderType'];
    hardDelete(): this['NumberQueryBuilderType'];
    undelete(): this['NumberQueryBuilderType'];
    whereDeleted(): this['ArrayQueryBuilderType'];
    whereNotDeleted(): this['ArrayQueryBuilderType'];
}