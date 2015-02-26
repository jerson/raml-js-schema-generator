


module.exports = function(schemaType){
    
    var type = '';
    
    switch (schemaType) {
        case 'string': 
            type = 'VARCHAR'; 
            break;
        case 'number':
            type = 'FLOAT';
            break;
        case 'integer':
            type = 'INTEGER';
            break;
        case 'boolean':
            type = 'TINYINT';
            break;
        case 'object':
            type = 'INTEGER';
            break;
        case 'array':
            type = 'VARCHAR';
            break;
        case 'null':
            type = 'VARCHAR';
            break;
        case 'any':
            type = 'VARCHAR';
            break;
        default:
            type = 'VARCHAR';
            break;
    }
    
    return type;
}