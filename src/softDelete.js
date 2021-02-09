const softDelete = (options) => {
    if (options.columnName === undefined) {
        throw new Error("Option 'columnName' is not defined");
    } else if (typeof options.columnName !== 'string') {
        throw new Error("Option 'columnName' must be a string");
    }

    if (options.deletedValue === undefined) {
        throw new Error("Option 'deletedValue' is not defined");
    }

    if (options.notDeletedValue === undefined) {
        throw new Error("Option 'notDeletedValue' is not defined");
    }

    return (Model) => {
        class SDQueryBuilder extends Model.QueryBuilder {
            // override the normal delete function with one that patches the row's "deleted" column
            delete() {
                this.context({
                    softDelete: true,
                });
                const patch = {};
                patch[options.columnName] = options.deletedValue;
                return this.patch(patch);
            }

            // provide a way to actually delete the row if necessary
            hardDelete() {
                return super.delete();
            }

            // restore the deleted row
            restore() {
                this.context({
                    restore: true,
                });
                const patch = {};
                patch[options.columnName] = options.notDeletedValue;
                return this.patch(patch);
            }

            // get only the non deleted records
            whereNotDeleted() {
                // qualify the column name
                return this.where(
                    `${this.modelClass().tableName}.${options.columnName}`,
                    options.notDeletedValue
                );
            }
        }
        return class extends Model {
            static get QueryBuilder() {
                return SDQueryBuilder;
            }

            static query(...args) {
                let query = super.query(...args);

                query = query.whereNotDeleted();

                return query.runAfter((result) => result);
            }

            static queryWithDeleted(...args) {
                const query = super.query(...args);

                return query.runAfter((result) => result);
            }

            // add a named filter for use in the .withGraphFetched() function
            static get namedFilters() {
                // patch the notDeleted filter into the list of namedFilters
                return {
                    ...super.namedFilters,
                    deleted: (b) => {
                        b.whereDeleted();
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
