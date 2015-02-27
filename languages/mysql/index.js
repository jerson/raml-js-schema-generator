var swig = require('swig'),
    util = require('util'),
    beautify = require('./../../lib/beautify');

require('./filters/base');
require('./filters/custom');

var render = function (file, params) {
    return swig.renderFile(util.format('%s/templates/%s.swig', __dirname, file), params);

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

        var schema = JSON.parse(schemas[name]);
        outputScript += render('table.sql', {name: name, schema: schema, schemas: schemas});
        outputScript += "\n";

    });

    files['script.sql'] = outputScript;

    return {
        files: files
    };
};