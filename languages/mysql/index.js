var swig = require('swig'),
    util = require('util');

var render = function (file, params) {
    return swig.renderFile(util.format('%s/templates/%s.swig', __dirname, file), params);

};

module.exports = function (ast, options) {
    return {
        files: {
            'user.sql': render('table.sql', ast)
        }
    };
};