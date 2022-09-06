import {
    Model,
    QueryBuilder,
    Page,
    PartialModelObject,
    Modifiers,
} from 'objection';

interface PluginOptions {
    columnName: string;
    deletedValue: Date | boolean | number;
    notDeletedValue: boolean | null;
}

export type ModelConstructor<T extends Model = Model> = new (
    ...args: any[]
) => T;

export function softDelete(pluginOptions?: Partial<PluginOptions>) {
        const options: PluginOptions = {
        columnName: 'deleted_at',
        deletedValue: new Date(),
        notDeletedValue: null,
        ...pluginOptions,
    };

    class SDQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<M, R> {
        ArrayQueryBuilderType!: SDQueryBuilder<M, M[]>;
        SingleQueryBuilderType!: SDQueryBuilder<M, M>;
        NumberQueryBuilderType!: SDQueryBuilder<M, number>;
        PageQueryBuilderType!: SDQueryBuilder<M, Page<M>>;

        // override the normal delete function with one that patches the row's "deleted" column
        delete(): this['NumberQueryBuilderType'] {
            this.context({
                softDelete: true,
            });
            const patch: Record<string, unknown> = {};

            patch[options.columnName] = options.deletedValue;

            return this.patch(patch as PartialModelObject<M>);
        }

        // provide a way to actually delete the row if necessary
        hardDelete() {
            return super.delete();
        }

        // provide a way to undo the delete
        undelete() {
            this.context({
                undelete: true,
            });

            const patch: Record<string, unknown> = {};
            patch[options.columnName] = options.notDeletedValue;

            return this.patch(patch as PartialModelObject<M>);
        }

        // provide a way to filter to ONLY deleted records without having to remember the column name
        whereDeleted(): this {
            const modelClass = this.modelClass();
            const tableRef = this.tableRefFor(modelClass as any);

            // this if is for backwards compatibility, to protect those that used a nullable `deleted` field
            if (options.deletedValue === true) {
                return this.where(
                    `${tableRef}.${options.columnName}`,
                    options.deletedValue
                );
            }
            // qualify the column name
            return this.whereNot(
                `${tableRef}.${options.columnName}`,
                options.notDeletedValue
            );
        }

        // provide a way to filter out deleted records without having to remember the column name
        whereNotDeleted(): this {
            const modelClass = this.modelClass();
            const tableRef = this.tableRefFor(modelClass as any);

            // qualify the column name
            return this.where(
                `${tableRef}.${options.columnName}`,
                options.notDeletedValue
            );
        }
    }

    return function <T extends ModelConstructor>(Base: T)
        {

        return class extends Base {
            static QueryBuilder = SDQueryBuilder;

            QueryBuilderType!: SDQueryBuilder<this, this[]>;

            static get modifiers(): Modifiers<SDQueryBuilder<Model>> {
                return {
                    notDeleted(builder: SDQueryBuilder<Model, Model[]>) {
                        builder.whereNotDeleted();
                    },
                    deleted(builder: SDQueryBuilder<Model, Model[]>) {
                        builder.whereDeleted();
                    },
                };
            }

            static get isSoftDelete() {
                return true;
            }
        };
    };
}

export default softDelete;