import {
    Model,
    QueryBuilder,
    Page,
    PartialModelObject,
} from 'objection';

interface PluginOptions {
    columnName: string;
    deletedValue: Date | boolean | number;
    notDeletedValue: boolean | null;
}

function softDelete(pluginOptions?: Partial<PluginOptions>) {
    const options: PluginOptions = {
        columnName: 'deleted_at',
        deletedValue: new Date(),
        notDeletedValue: null,
        ...pluginOptions,
    };

    type SDModelConstructor = new (...input: any[]) => Model;
    type SDMixin<T extends SDModelConstructor> = SDModel<T> & T;

    interface SDModel<T extends SDModelConstructor> {
        options: PluginOptions;
        isSoftDelete: boolean;
        QueryBuilder: typeof SDQueryBuilder;
        new(...args: any[]): SDModelInstance<T> & T;
    }


    interface SDModelInstance<T extends SDModelConstructor> {
        /* MyQueryBuilder<this, this[]> would be optimal, but not possible since `this`
         * doesn't extend Model. Not sure what this affects either.
         */
        // @ts-ignore
        QueryBuilderType: SDQueryBuilder<this & InstanceType<T>, this[]>;
    }

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
        whereDeleted() {
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
        whereNotDeleted() {
            const modelClass = this.modelClass();
            const tableRef = this.tableRefFor(modelClass as any);

            // qualify the column name
            return this.where(
                `${tableRef}.${options.columnName}`,
                options.notDeletedValue
            );
        }
    }

    return function <T extends SDModelConstructor>(Base: T) {
        return class extends Base {
            public static options = options;
            static QueryBuilder = SDQueryBuilder;
            QueryBuilderType!: SDQueryBuilder<this, this[]>;

            static get modifiers() {
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
        } as unknown as SDMixin<T>;
    };
}

export default softDelete;
