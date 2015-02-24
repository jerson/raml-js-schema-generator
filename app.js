var raml = require('raml-parser');


var definition = [
    '#%RAML 0.8',
    '---',
    'title: MyApi',
    'baseUri: http://myapi.com',
    '/Root:'
  ].join('\n');

  raml.compose(definition).then( function(rootNode) {
    //   console.log(rootNode);
    console.log('Root Node: ' + JSON.stringify(rootNode,true))
  }, function(error) {
    console.log('Error parsing: ' + error);
  });