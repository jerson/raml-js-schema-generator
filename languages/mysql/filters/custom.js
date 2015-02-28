var swig = require('swig'),
    S = require('string'),
    util = require('util'),
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

    return property === 'integer' && (property.indentity || property.autoIncrement);

});

swig.setFilter('primaryKeys', function (properties, name) {

    var constraint = '';
    var primary = [];
    var keys = typeof properties === 'object' ? Object.keys(properties) : [];
    keys.forEach(function (name) {
        var property = properties[name];
        if (property.primary) {
            primary.push(name);
        }
    });

    if (!primary.length && keys.length) {
        primary.push(keys[0]); 
    }
 
    if (primary) {
        var values = [];
        primary.forEach(function (value) {
            values.push(util.format('`%s`', value));
        });

        constraint = util.format('PRIMARY KEY (%s)', values.toString());

        var indexName = util.format('%s_PK', name);
        return util.format('ALTER TABLE `%s` ADD CONSTRAINT `%s` %s;', name, indexName, constraint);
    }

    return constraint;


});

swig.setFilter('uniqueKeys', function (properties, name) {

    var constraint = '';
    var primary = [];
    var keys = typeof properties === 'object' ? Object.keys(properties) : [];
    keys.forEach(function (name) {
        var property = properties[name];
        if (property.uniqueItems || property.unique) {
            primary.push(name);
        }
    });

    if (primary) {

        var values = [];
        primary.forEach(function (value) {
            var indexName = util.format('%s_%s_UK', name, value);
            var fragment = util.format('UNIQUE (`%s`)', value);
            values.push(util.format('ALTER TABLE `%s` ADD CONSTRAINT `%s` %s;', name, indexName, fragment));
        });

        constraint = values.join('\n');
    }

    return constraint;


});

swig.setFilter('foreignKeys', function (properties, name, schemas) {

    var constraint = '';
    var primary = [];
    var keys = typeof properties === 'object' ? Object.keys(properties) : [];
    keys.forEach(function (name) {
        var property = properties[name];
        if (property.ref && property.type === 'object') {
            primary.push({
                name: name,
                properties: property
            });
        }
    });

    if (primary) {


        var values = [];
        primary.forEach(function (property) {

            var propertyReferenced = property.properties.ref;
            var schemaReferenced = JSON.parse(schemas[propertyReferenced]);
            if (schemaReferenced) {

                //FIXME deberia sorporte multiples keys ?
                var primaryReferenced = '';
                Object.keys(schemaReferenced.properties).forEach(function (name) {

                    var property = schemaReferenced.properties[name];
                    if (property.primary) {
                        primaryReferenced = name;
                        return;
                    }

                });

                if (!primaryReferenced) {
                    console.error('no se encontró PRIMARY KEY');
                }

                var value = property.name;
                var indexName = util.format('%s_%s_FK', name, value);
                var fragment = util.format('FOREIGN KEY (`%s`) REFERENCES %s(`%s`)', value, propertyReferenced, primaryReferenced);
                values.push(util.format('ALTER TABLE `%s` ADD CONSTRAINT `%s` %s ON UPDATE CASCADE ON DELETE CASCADE;', name, indexName, fragment));

            } else {
                console.error('no se schema referenciado %s', property.ref);
            }
        });

        constraint = values.join('\n');
    }

    return constraint;


});

