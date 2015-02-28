var util = require('util'),
    keysParser = require('./keys');

exports.schema = function(schemaString){
    return JSON.parse(schemaString);
};

exports.foreignType = function (property, schemas) {

    var fallbackType = 'INT(11)';

    var propertyReferenced = property.ref;
    if (schemas.hasOwnProperty(propertyReferenced)) {

        var schemaReferenced = exports.schema(schemas[propertyReferenced]);
        if (schemaReferenced.properties) {
            Object.keys(schemaReferenced.properties).forEach(function (name) {

                var property = schemaReferenced.properties[name];
                if (property.primary) {
                    propertyReferenced = property;
                    return true;
                }

            });
        }

        if (!propertyReferenced) {
            return fallbackType;
        }

        return exports.type(propertyReferenced, schemas);
    } else {
        return fallbackType;
    }

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

    //  CREATE TABLE `dsfsdfdsf` (
    //`id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    //`pruebaq` tinyint(1) DEFAULT NULL,
    //`prueba3` float DEFAULT NULL,
    //`prueba5` double DEFAULT NULL,
    //`weqwewqe` double DEFAULT NULL,
    //`wewqe` double DEFAULT NULL,
    //`wrerwe` decimal(10,0) DEFAULT NULL,
    //`werwewr` char(1) DEFAULT NULL,
    //`werwerds` varchar(455) DEFAULT NULL,
    //`asdasd` int(11) DEFAULT NULL,
    //`qkeoqwje` text,
    //`werewrsssss` date DEFAULT NULL,
    //`tytrytrytr` datetime DEFAULT NULL,
    //`dfsdhewsdfsd` timestamp NULL DEFAULT NULL,
    //`dsfsdcxq` time DEFAULT NULL,
    //`rwasdvbv` year(4) DEFAULT NULL,
    //      PRIMARY KEY (`id`)
    //  ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

    switch (property.type) {
        case 'string':
            type = util.format('VARCHAR(%d)', length);
            break;
        case 'number':
            type = 'DOUBLE';
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
            //TODO agregar soporte para arrays
            type = 'VARCHAR(250)';
            break;
        case 'null':
            type = 'CHAR(1)';
            break;
        case 'any':
            type = 'TEXT';
            break;
        //FIXME estos no son estandares JSON SCHEMA
        case 'date':
            type = 'DATE';
            break;
        case 'datetime':
            type = 'DATETIME';
            break;
        case 'time':
            type = 'TIME';
            break;
        case 'timestamp':
            type = 'TIMESTAMP';
            break;
        default:
            type = 'VARCHAR(250)';
            break;
    }


    return type;
};