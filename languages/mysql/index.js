var swig = require('swig'),
    util = require('util'),
    fs = require('fs'),
    S = require('string'),
    schemaParser = require('../base/parser/schema'),
    keysParser = require('../base/parser/keys'),
    template = require('./render/template');


var getSchemas = function (ast) {
    var schemas = {};

    ast.schemas.forEach(function (data) {

        var keys = Object.keys(data);
        var tableName = keys[0] ? keys[0] : '';
        schemas[tableName] = data[tableName];

    });

    return schemas;
};

module.exports = function (ast, options) {


    var files = {};
    var schemas = getSchemas(ast);
    var schemasKeys = Object.keys(schemas);
    var outputScript = 'SET GLOBAL FOREIGN_KEY_CHECKS=0;\n';

    schemasKeys.forEach(function (name) {

        var schema = schemaParser.parse(schemas[name]);
        outputScript += template.render('table.sql', {name: name, schema: schema, schemas: schemas});
        outputScript += "\n";

    });

    schemasKeys.forEach(function (name) {

        var schema = schemaParser.parse(schemas[name]);
        outputScript += template.render('constraints.sql', {name: name, schema: schema, schemas: schemas});
        outputScript += "\n";

    });

    var relations = {};
    schemasKeys.forEach(function (schemaName) {

            var schema = schemaParser.parse(schemas[schemaName]);

            Object.keys(schema.properties).forEach(function (name) {

                var property = schema.properties[name];
                //TODO mejorar esto, hay muchas mas posibilidades cuando se usan los array de JSON SCHEMA
                if (property.type === 'array' && property.items) {

                    if (!Array.isArray(property.items)) {
                        property.items = [property.items];
                    }

                    property.items.forEach(function (item) {

                            if (item.type !== 'object') {
                                //return false;
                            }

                            //if (item.ref) {
                            //    relSchema = schemas[item.ref] ? schemaParser.parse(schemas[item.ref]) : {};
                            //    relSchemaName = item.ref;
                            //    relSchemaExist = true;
                            //} else if (schemas[item.name]) {
                            //    relSchemaName = item.name;
                            //    relSchema = schemas[item.name] ? schemaParser.parse(schemas[item.name]) : {};
                            //    relSchemaExist = true;
                            //} else {
                            //    relSchemaName = item.name;
                            //    relSchema = item;
                            //    relSchemaExist = false;
                            //}
                            var relSchema;
                            var relSchemaExist = true;
                            var relSchemaName;

                            if (item.ref && schemas.hasOwnProperty(item.ref)) {
                                relSchema = schemas[item.ref];
                                relSchemaName = item.ref;
                                relSchemaExist = true;
                            } else if (schemas.hasOwnProperty(item.name)) {
                                relSchemaName = item.name;
                                relSchema = schemas[item.name];
                                relSchemaExist = true;
                            } else {
                                relSchemaName = item.name;
                                relSchema = JSON.stringify(item);
                                relSchemaExist = false;
                            }
                            //if (item.ref && schemas[item.ref]) {
                            //    relSchema = schemas[item.ref];
                            //    relSchemaName = item.ref;
                            //    relSchemaExist = true;
                            //} else {
                            //    relSchemaName = item.name;
                            //    relSchema = schemas[item.name];
                            //    relSchemaExist = true;
                            //}

                            var relSchemaDetailsName = util.format('%s_%s', schemaName, relSchemaName);

                            relations[relSchemaDetailsName] = {
                                parent: {
                                    schema: schema,
                                    name: schemaName
                                },
                                child: {
                                    schema: relSchema ? schemaParser.parse(relSchema) : null,
                                    name: relSchemaName,
                                    exist: relSchemaExist
                                },
                                item: item
                            };


                        }
                    )
                    ;

                }

            });

        }
    );


    var cleanPrimaryProperties = function (propertyOld, schemaNameOld) {

        var propertyRel = {};
        var property = Object.clone(propertyOld, true);
        var schemaName = Object.clone(schemaNameOld, true);

        if (property && typeof property === 'object') {

            Object.keys(property).forEach(function (propertyName) {
                delete property[propertyName].primary;
                delete property[propertyName].unique;
                delete property[propertyName].uniqueItems;
                delete property[propertyName].autoIncrement;

                property[propertyName].name = schemaName;
                property[propertyName].ref = schemaName;
                property[propertyName].type = 'object';
                propertyRel[schemaName] = property[propertyName];
            });
        }


        return propertyRel;
    };


    Object.keys(relations).forEach(function (relationName) {

        var relation = relations[relationName];
        if (!schemas[relation.child.name]) {
            schemas[relation.child.name] = relation.child.schema;
        }

    });

    console.log(Object.keys(schemas));
    console.log(relations);

    Object.keys(relations).forEach(function (relationName) {

        var relation = relations[relationName];

        if (!relation || !relation.child || !relation.child.schema || !relation.child.schema.properties) {
            return false;
        }

        var schema = relation.parent.schema;
        var schemaChild = relation.child.schema;


        var propertySchemaOld = keysParser.firstPrimaryKey(schema);
        var propertyRelSchemaOld = keysParser.firstPrimaryKey(schemaChild);

        var propertySchema = cleanPrimaryProperties(propertySchemaOld, relation.parent.name);
        var propertyRelSchema = cleanPrimaryProperties(propertyRelSchemaOld, relation.child.name);


        var requiredFields = Object.keys(propertySchema).union(Object.keys(propertyRelSchema));

        var properties = Object.merge(propertySchema, propertyRelSchema);
        var newSchema = {
            properties: properties,
            required: requiredFields
        };


        if (!relation.child.exist && Object.keys(relation.child.schema.properties).length) {
            outputScript += "\n";
            outputScript += template.render('table.sql', {
                name: relation.child.name,
                schema: relation.child.schema,
                schemas: schemas
            });
            outputScript += template.render('constraints.sql', {
                name: relation.child.name,
                schema: relation.child.schema,
                schemas: schemas
            });
            outputScript += "\n";
        }

        if (Object.keys(newSchema.properties).length) {
            outputScript += "\n";
            outputScript += template.render('table.sql', {name: relationName, schema: newSchema, schemas: schemas});
            outputScript += template.render('constraints.sql', {
                name: relationName,
                schema: newSchema,
                schemas: schemas
            });
            outputScript += "\n";
        }

    });

    outputScript += 'SET GLOBAL FOREIGN_KEY_CHECKS=1;\n';

    files['script.sql'] = outputScript;

    return {
        files: files
    };
}
;