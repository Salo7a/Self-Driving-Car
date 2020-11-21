import { Meteor } from 'meteor/meteor';
const find = require('local-devices');


Meteor.startup(() => {

    find().then(devices => {
        console.log(devices); /*
  [
    { name: '?', ip: '192.168.0.10', mac: '...' },
    { name: '...', ip: '192.168.0.17', mac: '...' },
    { name: '...', ip: '192.168.0.21', mac: '...' },
    { name: '...', ip: '192.168.0.22', mac: '...' }
  ]
  */
    })

});
