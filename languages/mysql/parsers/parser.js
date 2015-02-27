var util = require('util');

exports.foreignType = function (property, schemas) {

    var type = '';

    var propertyReferenced = property.ref;
    var schemaReferenced = JSON.parse(schemas[propertyReferenced]);
    if (schemaReferenced) {

        var propertyReferenced = '';
        Object.keys(schemaReferenced.properties).forEach(function (name) {

            var property = schemaReferenced.properties[name];
            if (property.primary) {
                propertyReferenced = property;
                return;
            }

        });

        if (!propertyReferenced) {
            return 'INT(11)';
        }

        return exports.type(propertyReferenced, schemas);
    }

    return type;
};

exports.type = function (property, schemas) {

    var type = '';

    if (property.enum) {
        var values = [];
        property.enum.forEach(function (value) {
            values.push(util.format('\'%s\'', value));
        });

        type = util.format('ENUM (%s)', values.toString());
    }

    if (type) {
        return type;
    }

    var length = property.maxLength ? property.maxLength : (property.length ? property.length : 255 );

    switch (property.type) {
        case 'string':
            type = util.format('VARCHAR(%d)', length);
            break;
        case 'number':
            type = 'FLOAT';
            break;
        case 'integer':
            type = util.format('INT(%d)', length > 11 ? 11 : length);
            break;
        case 'boolean':
            type = 'TINYINT(1)';
            break;
        case 'object':
            type = exports.foreignType(property, schemas);
            break;
        case 'array':
            type = 'VARCHAR(250)';
            break;
        case 'null':
            type = 'VARCHAR(250)';
            break;
        case 'any':
            type = 'VARCHAR(250)';
            break;
        default:
            type = 'VARCHAR(250)';
            break;
    }


    return type;
};