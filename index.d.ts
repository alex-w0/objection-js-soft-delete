declare module 'objection-js-soft-delete' {
    import { Model, QueryBuilder } from 'objection';

    class SDQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<M, R> {
        ArrayQueryBuilderType: SDQueryBuilder<M>;

        NumberQueryBuilderType: SDQueryBuilder<M, number>;

        delete(): this['NumberQueryBuilderType'];
        hardDelete(): this['NumberQueryBuilderType'];
        undelete(): this['NumberQueryBuilderType'];
        whereDeleted(): this['ArrayQueryBuilderType'];
        whereNotDeleted(): this['ArrayQueryBuilderType'];
    }

    interface SDInstance<T extends typeof Model> {
        QueryBuilderType: SDQueryBuilder<this & T['prototype']>;
    }

    interface SDStatic<T extends typeof Model> {
        QueryBuilder: typeof SDQueryBuilder;
        isSoftDelete: boolean;
        namedFilters(): object;

        new (): SDInstance<T> & T['prototype'];
    }

    export default function softDelete<T extends typeof Model>(
        options?: Partial<{
            columnName: string;
            deletedValue: Date | true | number;
            notDeletedValue: false | null;
        }>
    ): (model: T) => SDStatic<T> & Omit<T, 'new'> & T['prototype'];
}
