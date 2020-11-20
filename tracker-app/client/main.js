import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { MeteorCameraUI } from 'meteor/okland:camera-ui';

import './main.html';

// document.addEventListener("deviceready", onDeviceReady, false);

// function onDeviceReady() {
//     console.log(navigator.camera);
// }


if (Meteor.isServer) {
  console.log("Printed on the server");
}

if (Meteor.isClient) {
  console.log("Printed in browsers and mobile apps");

  Template.takePhoto.events({
    'click .capture': function(){
      console.log("Button clicked.");
      
      // // MeteorCamera.getPicture({width: 300, height: 300, quality: 100}, function(error, data) {
      // //   let image = document.getElementById('myImage');
      // //   image.src = data;
      // // });
      // onLoad();

      // navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
      //     destinationType: Camera.DestinationType.DATA_URL
      // });

      // MeteorCameraUI.getPicture({width: 500, height: 500, quality: 50}, function(error, data) {
      //     if (error) {
      //       throw error;
      //     }

      //     let image = document.getElementById('myImage');
      //     image.src = data;
      // });

    }
  });

  // Template.takePhoto.helpers({
  //   'photo': function() {
  //     return Session.get('photo');
  //   }
  // });

}

if (Meteor.isCordova) {
  console.log("Printed only in mobile Cordova apps");

  Template.takePhoto.events({
    'click .capture2': function () {
      Meteor.startup(function() {
        console.log("Capture 2");
        
        navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
          destinationType: Camera.DestinationType.DATA_URL
        });
      });
    }
  });

  Template.takePhoto.events({
    'click .capture': function(event){
      console.log("Button clicked.");

      navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
        destinationType: Camera.DestinationType.DATA_URL
      });

      // MeteorCameraUI.getPicture({width: 500, height: 500, quality: 50}, function(error, data) {
      //   if (error) {
      //     throw error;
      //   }

      //   let image = document.getElementById('myImage');
      //   image.src = data;
      // });

      // MeteorCamera.getPicture({width: 300, height: 300, quality: 100}, function(error, data) {
      //   console.log(data);
      //   let image = document.getElementById('myImage');
      //   // image.src = "data:image/jpeg;base64," + data;
      //   image.src = data;
      //   // Session.set('photo', data);
      // });
    }
  });

  // navigator.camera.getPicture(onSuccess, onFail, { quality: 25,
  //   destinationType: Camera.DestinationType.DATA_URL
  // });
}


function onSuccess(imageData) {
  let image = document.getElementById('myImage');
  image.src = imageData;
}

function onFail(message) {
  alert('Failed because: ' + message);
}

// navigator.camera.getPicture(onSuccess, onFail, { quality: 25,
//   destinationType: Camera.DestinationType.DATA_URL
// });


// MeteorCameraUI.getPicture({width: 500, height: 500, quality: 50}, function(error, data) {
//   let image = document.getElementById('myImage');
//   image.src = "data:image/jpeg;base64," + data;
//   console.log(error);
// });

// Meteor.startup(function() {
//   navigator.camera.getPicture(onSuccess, onFail, { quality: 50,
//     destinationType: Camera.DestinationType.DATA_URL
//   });
// });

