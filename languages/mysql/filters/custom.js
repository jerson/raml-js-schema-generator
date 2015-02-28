var swig = require('swig'),
    S = require('string'),
    util = require('util'),
    keysParser = require('../parsers/keys'),
    parser = require('../parsers/parser');

swig.setFilter('parseType', function (property, schemas) {
    return parser.type(property, schemas);
});

swig.setFilter('isRequired', function (property, schema) {
    if (typeof schema.required !== 'object') {
        return false;
    }

    return schema.required.indexOf(property) !== -1;
});

swig.setFilter('isIdentity', function (property) {

    return property.type === 'integer' && (property.indentity || property.autoIncrement);

});

swig.setFilter('primaryKeys', function (schema, nameSchema) {

    var keys = keysParser.primaryKeys(schema);
    var keysNames = Object.keys(keys);
    if (!keysNames || !keysNames.length) {
        return '';
    }

    var values = [];
    keysNames.forEach(function (name) {
        values.push(util.format('`%s`', name));
    });

    var constraint = util.format('PRIMARY KEY (%s)', values.toString());
    var indexName = util.format('%s_PK', nameSchema);
    return util.format('ALTER TABLE `%s` ADD CONSTRAINT `%s` %s;', nameSchema, indexName, constraint);


});

swig.setFilter('uniqueKeys', function (schema, nameSchema) {

    var keys = keysParser.uniqueKeys(schema);
    var keysNames = Object.keys(keys);
    if (!keysNames || !keysNames.length) {
        return '';
    }

    var values = [];
    keysNames.forEach(function (name) {
        var indexName = util.format('%s_%s_UK', nameSchema, name);
        var fragment = util.format('UNIQUE (`%s`)', name);
        values.push(util.format('ALTER TABLE `%s` ADD CONSTRAINT `%s` %s;', nameSchema, indexName, fragment));
    });

    return values.join('\n');

});

swig.setFilter('foreignKeys', function (schema, nameSchema, schemas) {

    var keys = keysParser.foreignKeys(schema, schemas);
    var keysNames = Object.keys(keys);
    if (!keysNames || !keysNames.length) {
        return '';
    }

    var values = [];
    keysNames.forEach(function (name) {

        var property = keys[name];
        if(!property.refObject){
            return false;
        }

        var propertyReference = property.ref;
        var propertyReferencedKeys =  Object.keys(property.refObject);
        var propertyReferencedKeyName = propertyReferencedKeys.length ? propertyReferencedKeys[0] : null;

        var indexName = util.format('%s_%s_FK', nameSchema, name);
        var fragment = util.format('FOREIGN KEY (`%s`) REFERENCES %s(`%s`)', name, propertyReference, propertyReferencedKeyName);
        values.push(util.format('ALTER TABLE `%s` ADD CONSTRAINT `%s` %s ON UPDATE CASCADE ON DELETE CASCADE;', nameSchema, indexName, fragment));


    });

    return values.join('\n');

});

