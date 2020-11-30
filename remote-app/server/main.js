import { Meteor } from 'meteor/meteor';

const {PythonShell} = require('python-shell');

let ESP_IP;
let mediaStream;
let file_path = 'D:/Study/Courses/College/Electronics-Tasks-4th-Year/task3-sbe403a_f20_task3_03/remote-app/server/lanedetection.py'

let pyshell = new PythonShell(file_path, {mode: 'json'});

let testObj = {"a": 10, "b": "ok"};

Meteor.startup(() => {
    // code to run on server at startup
    // sends a message to the Python script via stdin

    // pyshell.send('hello');
    // pyshell.send(testObj)
    pyshell.send({ command: "do_stuff", args: [1, 2, 3] });

    pyshell.on('message', async function (error, message) {
      await console.log("inside on call"); 
      if (error) throw error;
      // received a message sent from the Python script (a simple "print" statement)
      console.log(message);
    });

    // end the input stream and allow the process to exit
    pyshell.end(function (err, code, signal) {
      if (err) throw err;
      console.log('The exit code was: ' + code);
      console.log('The exit signal was: ' + signal);
      console.log('finished');
    });


    Meteor.methods({
      getStream(mStream) {
        console.log("FROM SERVER METHOD");
        mediaStream = mStream;

        let options = {
            mode: 'binary',
            // pythonPath: 'path/to/python',
            pythonOptions: ['-u'],
            // scriptPath: './lanedetection.py',
            args: mediaStream
        };

        // PythonShell.run(file_path, options, function (err, results) {
        //   if (err) throw err;
    
        //   // results is an array consisting of messages collected during execution
        //   console.log('results: %j', results);
        // });

        
      },


      getESPIP(espIP) {
        ESP_IP = espIP;
        console.log(ESP_IP);
      },

    });

});
