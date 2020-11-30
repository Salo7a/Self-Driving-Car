import { Meteor } from 'meteor/meteor';
const {spawn} = require('child_process');
const {PythonShell} = require('python-shell');

let location;

Meteor.startup(() => {
    // code to run on server at startup
    let options = {
      mode: 'text',
      // pythonPath: 'path/to/python',
      pythonOptions: ['-u'],
      // scriptPath: './lanedetection.py',
      args: [5]
    };

    const file_path = 'D:/Study/Courses/College/Electronics-Tasks-4th-Year/task3-sbe403a_f20_task3_03/remote-app/server/lanedetection.py'
    // PythonShell.run(file_path, options, function (err, results) {
    //   if (err) {
    //       throw err;
    //   };

    //   // results is an array consisting of messages collected during execution
    //   console.log('results: %j', results);
    // });
  

  async function runScript(data) {
    console.log(data);
    const python = await spawn('python', [file_path, data]);
    await python.stdout.on('data', async function (data) {
        console.log('Pipe data from python script ...');
        location = await parseInt(data.toString()[1]);
        console.log("the location is", location);
    });
  };

  let loc = runScript(5);
});
