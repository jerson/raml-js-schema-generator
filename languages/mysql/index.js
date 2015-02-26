var swig = require('swig'),
    util = require('util');

var render = function (file, params) {
    return swig.renderFile(util.format('%s/templates/%s.swig', __dirname, file), params);

};

module.exports = function (ast, options) {
    
    
    var files = {}; 
    console.log(ast.schemas);
    ast.schemas.forEach(function(name,index){
        
         var schema = ast.schemas[name];
        
        files[name]=render('table.sql', {name:name,schema:schema}); 
        
    });
    
    return {
        files: files
    };
};