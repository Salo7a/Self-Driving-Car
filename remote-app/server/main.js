import { Meteor } from 'meteor/meteor';

let ESP_IP;

Meteor.startup(() => {
    // code to run on server at startup

    // Methods to be called from client-side
    Meteor.methods({
      sendESPIP(espIP) {
        ESP_IP = espIP;
        console.log(ESP_IP);
      },
    });
});
