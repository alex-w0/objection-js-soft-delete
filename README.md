[![Build Status](https://travis-ci.com/alex-w0/objection-js-soft-delete.svg?token=r6PqdFxBVzxy7yMFo5GV&branch=master)](https://travis-ci.com/alex-w0/objection-js-soft-delete) ![NPM](https://img.shields.io/npm/l/objection-js-soft-delete)

# objection-js-soft-delete

---
This plugin is a fork from [objection-soft-delete](https://github.com/griffinpp/objection-soft-delete) where the author stopped maintaining the plugin. For that reason the project was completely rewritten and the [use of deprecated methods is fixed](https://github.com/griffinpp/objection-soft-delete/issues/18).
`Important note: The default options for this plugin has been changed, so check first if you have to change these if necessary.`

---
A plugin that adds soft-delete functionality to [Objection.js](https://github.com/Vincit/objection.js/)

* [Installation](#installation)
* [Register the plugin](#register-the-plugin)
* [Usage](#usage)
  * [Methods](#methods)
    * .whereNotDeleted()
    * .whereDeleted()
    * .undelete()
    * .hardDelete()
  * [Filters](#filters)
    * notDeleted
    * deleted
    * in a relationship
  * [Using with upsertGraph](#using-with-upsertgraph)
  * [Lifecycle functions](#lifecycle-functions)


## Installation

### NPM

```sh
npm i objection-js-soft-delete
```

### Yarn

```sh
yarn add objection-js-soft-delete
```

## Register the plugin

The mixin provides the following configuration to override the default options:

**columnName:** the column name that indicate if the record is deleted. The column must exist on the table for the model.
Default: `'deleted_at'`

**deletedValue:** define which value indicate if the record is deleted.
Default: `new Date()` (local time zone of the server)

It's also possible to use the time from the database: `knex.fn.now()`

**notDeletedValue:** define which value indicate if the record is not deleted. You can set (and should) this option along with `deletedValue`.
Default: `NULL`

```js
// Import objection and the plugin.
import { Model } from 'objection';
import objectionSoftDelete from 'objection-js-soft-delete';

// Specify the options for this plugin. This are the defaults.
const softDelete = objectionSoftDelete({
    columnName: 'deleted_at',
    deletedValue: new Date(),
    notDeletedValue: null,
});

// Inject the plugin to the model
class User extends softDelete(Model) {
  static get tableName() {
    return 'Users';
  }
}
```

**Note:** A `deletedValue` value of `NULL` will result in this plugin an unexpected behavior.

## Usage

- **Soft delete records:**
When an record will be deleted then the deleted field is set to the value that is specified as deletedValue:
```js
await User.query().where('id', 1).delete();
await User.query().deleteById(1);

// Deleted rows are still in the db:
// User { id: 1, deleted_at: 'Sat Oct 31 2020 15:42:29 GMT+0100 (Central European Standard Time)' , ... }
```

#### Methods

- **.whereNotDeleted():**
Returns only records that aren't deleted.
```js
const notDeletedUsers = await User.query().whereNotDeleted();
```

- **.whereDeleted():**
Returns only records that are deleted.
```js
const deletedUsers = await User.query().whereDeleted();
```

- **.undelete():**
Restore deleted records.

```js
await User.query().where('id', 1).undelete();
// User { id: 1, deleted_at: null }
```

- **.hardDelete():**
Permanently delete records.
```js
await User.query.where('id', 1).hardDelete();
```

#### Filters

A `notDeleted` and a `deleted` filter will be added to the list of named filters for any model that use this mixin. Internally they are using the methods `.whereNotDeleted()` and `.whereDeleted()` from above:
- **notDeleted:**
Returns only records from the relation that are not deleted.
```js
// withGraphFetched
const rows = await User.query().withGraphFetched('contact(notDeleted)');
// withGraphJoined
const rows = await User.query().withGraphJoined('contact(notDeleted)');
```

- **deleted:**
Returns only records from the relation that are deleted.
```js
// withGraphFetched
const rows = await User.query().withGraphFetched('contact(deleted)');
// withGraphJoined
const rows = await User.query().withGraphJoined('contact(deleted)');
```

- **Relationship filter:**
A filter can be applied also directly to a relationship:

```js
class User extends Model {
  static get tableName() {
    return 'user';
  }

  static get relationMappings() {
      const Contact = require('./Contact');

      return {
          contact: {
            relation: Model.ManyToManyRelation,
            modelClass: Contact,
            join: {
                from: 'user.id',
                through: {
                    from: 'user_contact.user_id',
                    to: 'user_contact.contact_id',
                },
                to: 'contact.id',
            },
            // .whereNotDeleted() or .whereDeleted()
            filter: (f) => f.whereNotDeleted(),
          },
      };
  }
}
```

then:
```js
// Will return only records from the relationship contact that are not deleted
await User.query().withGraphFetched('contact');
```

#### Using with upsertGraph
This plugin was actually born out of a need to have `.upsertGraph()` soft delete in some tables, and hard delete in others.
```js
// a model with soft delete
class Phone extends softDelete(Model) {
  static get tableName() {
    return 'Phones';
  }
}

// a model without soft delete
class Email extends Model {
  static get tableName() {
    return 'Emails';
  }
}

// assume a User model that relates to both, and the following existing data:
User {
  id: 1,
  name: 'Johnny Cash',
  phones: [
    {
      id: 6,
      number: '+19195551234',
    },
  ],
  emails: [
    {
      id: 3,
      address: 'mib@americanrecords.com',
    },
  ]
}

await User.query().upsertGraph({
  id: 1,
  name: 'Johnny Cash',
  phones: [],
  emails: [],
});
// => phone id 6 will be flagged deleted (and will still be related to Johnny!), email id 3 will be removed from the database
```

### Lifecycle Functions

One issue that comes with doing soft deletes is that your calls to `.delete()` will actually trigger lifecycle functions for `.update()`, which may not be expected or desired.  To help address this, some context flags have been added to the `queryContext` that is passed into lifecycle functions to help discern whether the event that triggered (e.g.) `$beforeUpdate` was a true update, a soft delete, or an undelete:
```js
$beforeUpdate(opt, queryContext) {
  if (queryContext.softDelete) {
    // do something before a soft delete, possibly including calling your $beforeDelete function.
    // Think this through carefully if you are using additional plugins, as their lifecycle
    // functions may execute before this one depending on how you have set up your inheritance chain!
  } else if (queryContext.undelete) {
    // do something before an undelete
  } else {
    // do something before a normal update
  }
}
  
// same procedure for $afterUpdate
```
Available flags are:
* softDelete
* undelete

Flags will be `true` if set, and `undefined` otherwise.

### Checking Whether a Model is SoftDelete

All models with the soft delete mixin will have an `isSoftDelete` property, which returns `true`.

```js
const modelHasSoftDelete = User.isSoftDelete;
```

## Tests

Tests can be run with:
```sh
npm test
```

or:

```sh
yarn test
```

## Linting

The linter can be run with:
```sh
npm run lint
```

or:
```sh
yarn lint
```