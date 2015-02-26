var raml = require('raml-parser');


// var definition = [
//     '#%RAML 0.8',
//     '---',
//     'title: MyApi',
//     'baseUri: http://myapi.com',
//     '/Root:'
//   ].join('\n');

  raml.loadFile('test/fixtures/api.raml').then( function(rootNode) {
  // raml.load(definition).then( function(rootNode) {
    //   console.log(rootNode);
    console.log('Root Node: ' + JSON.stringify(rootNode,null,2))
  }, function(error) {
    console.log('Error parsing: ' + error);
  });