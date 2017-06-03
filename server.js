'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const request = require('request');
const jsforce = require('jsforce');
const assert = require('assert');

// let conn = new jsforce.Connection({
//     //loginUrl: 'https://test.salesforce.com'
// });
// conn.login(process.env.SFUSER, process.env.SFPWDTK, function(err) {
//     if (err) { return console.error(err); }
// });

server.connection({
	port: process.env.PORT || 3000,
    routes: { cors: true }
});

server.register(require('inert'), function(err) {
   if (err) {throw err;}

   server.route({
     method : 'GET', path : '/public/{path*}',
     handler : {
       directory : {
       path : './public',
       listing : false,
       index : false
       }
    }

   });

});

server.register(require('vision'), (err) => {
  if (err) { console.log('Failed to load vision.'); }
  server.views({
    engines: { html: require('handlebars') },
    path: __dirname + '/public'
  });

  server.route({
    method: 'get',
    path: '/',
    handler: function (req, res) {

      res.view('index', {
        title: 'Kimberly\'s List',
      });

    }
  });


});

server.start((err) => {
	if (err) { throw err; }
	console.log('Server running at: ', server.info.uri)
});
