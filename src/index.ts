import { Model } from "objection";

interface PluginOptions {
    columnName: string,
    deletedValue: Date | boolean | number,
    notDeletedValue: boolean | null;
}

function softDelete<T extends typeof Model>(pluginOptions?: Partial<PluginOptions>) {
    const options = {
        columnName: 'deleted_at',
        deletedValue: new Date(),
        notDeletedValue: null,
        ...pluginOptions,
    };

    return (Model: T) => {
        class SDQueryBuilder extends Model.QueryBuilder<Model> {
            // override the normal delete function with one that patches the row's "deleted" column
            delete(): this['NumberQueryBuilderType'] {
                this.context({
                    softDelete: true,
                });
                const patch: Record<string, unknown> = {};

                patch[options.columnName] = options.deletedValue;
                return this.patch(patch);
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
                return this.patch(patch);
            }

            // provide a way to filter to ONLY deleted records without having to remember the column name
            whereDeleted() {
                const modelClass = this.modelClass() as T
                const tableRef = this.tableRefFor(modelClass);

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
                const modelClass: T = this.modelClass() as any
                const tableRef = this.tableRefFor(modelClass);

                // qualify the column name
                return this.where(
                    `${tableRef}.${options.columnName}`,
                    options.notDeletedValue
                );
            }
        }

        return class extends Model {
            
            static get QueryBuilder() {
                return SDQueryBuilder;
            }

            static get modifiers()  {
                return {
                    notDeleted(builder: SDQueryBuilder) {
                        builder.whereNotDeleted();
                    },
                    deleted(builder: SDQueryBuilder) {
                        builder.whereDeleted();
                    },
                };
            }

            static get isSoftDelete() {
                return true;
            }
        };
    };
};

export default softDelete;
