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

      sendImgURI(imgData) {
          // console.log("imgData: ", imgData);

          let options = {
            mode: 'text',
            pythonPath: 'C:/Users/Refaey/AppData/Local/Programs/Python/Python37/python.exe',
            pythonOptions: ['-u'],
            // scriptPath: './lanedetection.py',
            args: imgData
          };

          
          PythonShell.run(file_path, options, function (err, results) {
            if (err) throw err;
      
            // results is an array consisting of messages collected during execution
            console.log('results: %j', results);

            // Save the returned angle to send it to client-side for checking direction
            angle = results[0];

            // Some Conditions to choose direction
            direction = '/forward';

          });

          // $.ajax({
          //   url: ESP_IP + direction,
          //   success: (data) => {
          //       console.log(data);
          //   }
          // });
      },

    });

});
