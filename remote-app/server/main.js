import { Meteor } from 'meteor/meteor';

const {PythonShell} = require('python-shell');

let ESP_IP;
let angle;
let direction;
let file_path = 'D:/Study/Courses/College/Electronics-Tasks-4th-Year/task3-sbe403a_f20_task3_03/remote-app/server/lanedetection.py'


Meteor.startup(() => {
    // code to run on server at startup

    Meteor.methods({
      getStream(mStream) {
        console.log("mediaStream From Server", mStream);
      },

      sendESPIP(espIP) {
        ESP_IP = espIP;
        console.log(ESP_IP);
      },


      sendImgURI(frame) {
          // let frameData = frame.imgSrc;
          // console.log("frame is: ", frame[0]);
          // console.log("tag is: ", frame[1]);
          // let frameTag = frame.imgTag;
          // console.log("frameData: ", frameData);
          // console.log("screenShotTag: ", frameTag);
          let res = 5;
          let angle;
          let updated_frame;

          let options = {
            mode: 'text',
            pythonPath: 'C:/Users/Refaey/AppData/Local/Programs/Python/Python37/python.exe',
            pythonOptions: ['-u'],
            // scriptPath: './lanedetection.py',
            args: frame
          };


          PythonShell.run(file_path, options, function (err, results) {
            if (err) throw err;
      
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);
            // angle = results[0]
            // updated_frame = results[1]

            // Some Conditions to choose direction
            direction = '/forward';
            res = results;
          });

          // let pyshell = new PythonShell(file_path, options);
          // pyshell.send('Hello');

          // pyshell.on('message', function (message) {
          //   // received a message sent from the Python script (a simple "print" statement)
          //   console.log(message);
          // });

          // // end the input stream and allow the process to exit
          // pyshell.end(function (err, code, signal) {
          //   if (err) throw err;
          //   console.log('The exit code was: ' + code);
          //   console.log('The exit signal was: ' + signal);
          //   console.log('finished');
          // });

          return res;
          
      },

    });

});
