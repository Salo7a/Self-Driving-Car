import { Meteor } from 'meteor/meteor';
const findLocalDevices = require('local-devices');

let ESP_MAC = '2c:f4:32:71:5b:b7';
let ESP_IP = 'null';

Meteor.startup(() => {
  // code to run on server at startup
  // Methods to be called from client-side
  Meteor.methods({
    scanESP() {
      findLocalDevices().then(devices => {
        console.log("Searching..");
        console.log(devices);
        devices.forEach(device => {
          if (device['mac'] === ESP_MAC) {
            ESP_IP = device['ip'];
            console.log("ESP_IP: ", ESP_IP);
          }
        });
        if (ESP_IP === 'null') {
          console.log("ESP is Not Connected!!");
        }
      });
      
      return ESP_IP;
    },
  });
});
