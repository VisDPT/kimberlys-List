'use strict';

const Hapi = require('hapi');
const server = new Hapi.Server();
const request = require('request');
const jsforce = require('jsforce');
const assert = require('assert');

let conn = new jsforce.Connection({
    //loginUrl: 'https://test.salesforce.com'
});
conn.login(process.env.SFUSER, process.env.SFPWDTK, function(err) {
    if (err) { return console.error(err); }
});

server.connection({
	port: process.env.PORT || 5000,
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

  // API Routes
	server.route({
		method: 'get',
		path: '/locations/{city}',
		handler: function (req, res) {
			let city = encodeURIComponent(req.params.city).toUpperCase();
			console.log('Hello from', city);
			let people = getByCity('professional', city);
			res(people);
		}
	});

	server.route({
		method: 'get',
		path: '/api/locations/{city}',
		handler: function (req, res) {
			let city = encodeURIComponent(req.params.city).toUpperCase();
			console.log('Hello from', city);
			let people = getByCity('professional', city);
			res(people);
		}
	});


});

server.start((err) => {
	if (err) { throw err; }
	console.log('Server running at: ', server.info.uri)
});

// ---------
// Functions
// ---------

function getByCity(personType, city) {
	let promise = new Promise(function (resolve, reject) {
        conn.sobject('Member__c')
        .find({
            MemberType__c: personType,
			City__c: city
        }, {
            Id: 1,
			FirstName__c: 1,
			LastName__c: 1,
			"Organization__r.Name": 1,
			"Organization__r.Website__c": 1,
			JobTitle__c: 1,
			LinkedIn__c: 1,
			Twitter__c: 1,
			Website__c: 1,
			Gender__c: 1,
			MemberType__c: 1,
			Science__c: 1,
			Technology__c: 1,
			Engineering__c: 1,
			Math__c: 1,
			City__c: 1,
			State__c: 1

        })
        .sort({ FirstName__c: 1 })
        .execute(function (err, record) {
            if (err) { reject(console.error(err)) }
            if (record.length >= 1) {
            	let people = [];
            	record.forEach(function (person) {
            		let newPerson = createProfessionalObject(person);
					people.push(newPerson)
				});
                //console.log(createProfessionalObject(record[0]));
				console.log(people);
                resolve(people);
            } else {
                console.error('No matching records found.');
                reject();
            }
        });
    });
    return promise;
}

function createProfessionalObject(sObj) {
	let person = {};
	person.name = `${sObj.FirstName__c} ${sObj.LastName__c}`;
	person.title = sObj.JobTitle__c;
	person.company = sObj['Organization__r']['Name'];
	person.companyWebsite = sObj['Organization__r']['Website__c'];
	person.location = `${sObj.City__c}, ${sObj.State__c}`;
	person.linkedin = sObj.LinkedIn__c;
	person.twitter = sObj.Twitter__c;
	person.website = sObj.Website__c;
	person.gender = sObj.Gender__c;
	person.type = sObj.MemberType__c;
	person.interests = {
		science: sObj.Science__c,
		technology: sObj.Technology__c,
		engineering: sObj.Engineering__c,
		math: sObj.Math__c
	};
	
	return person;
}