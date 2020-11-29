import { Meteor } from 'meteor/meteor';
const {spawn} = require('child_process');
let location;

Meteor.startup(() => {
  // code to run on server at startup
  async function runScript(data) {
    console.log(data);
    const python = await spawn('python', ['lanedetection.py', data[0]]);
    await python.stdout.on('data', async function (data) {
        console.log('Pipe data from python script ...');
        location = await parseInt(data.toString()[1]);
        console.log("the location is", location);
    });
  };

  let loc = runScript([5]);
  console.log(loc);
});
