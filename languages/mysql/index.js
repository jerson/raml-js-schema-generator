var swig = require('swig'),
    util = require('util'),
    fs = require('fs'),
    S = require('string'),
    parser = require('./parsers/parser');

var includeFolder = require('include-folder'),
    folder = includeFolder(__dirname + '/templates');

require('./filters/base');
require('./filters/custom');


var render = function (file, params) {
    //return swig.renderFile(util.format('%s/templates/%s.swig', __dirname, file), params);

    //FIXME el nombre del archivo debería ser el mismo
    var fileName = S(file).replace('.', ' ').camelize().s;
    var template = swig.compile(folder[fileName], params);

    return template(params);

};

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
    var outputScript = '';
    Object.keys(schemas).forEach(function (name) {

        var schema = parser.schema(schemas[name]);
        outputScript += render('table.sql', {name: name, schema: schema, schemas: schemas});
        outputScript += "\n";

    });

    files['script.sql'] = outputScript;

    return {
        files: files
    };
};