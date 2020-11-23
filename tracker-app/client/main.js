import './main.html';

// code to run on server at startup
Meteor.startup(function() {
  if (Meteor.isCordova) 
  {
      // Here we can be sure the plugin has been initialized

      // Check Camera Permissions
      cordova.plugins.diagnostic.requestRuntimePermission(function(status) {
          switch(status) 
          {
              case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                  console.log("Permission granted to use the camera");
                  break;
              case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                  console.log("Permission to use the camera has not been requested yet");
                  break;
              case cordova.plugins.diagnostic.permissionStatus.DENIED_ONCe:
                  console.log("Permission denied to use the camera - ask again?");
                  break;
              case cordova.plugins.diagnostic.permissionStatus.DENIED_ALWAYS:
                  console.log("Permission permanently denied to use the camera - guess we won't be using it then!");
                  break;
          }
      }, function(error) {
          console.error("The following error occurred: " + error);
      }, cordova.plugins.diagnostic.permission.CAMERA);
  }
});

if (Meteor.isServer) {
  console.log("Printed on the server");
}

if (Meteor.isClient) {
  console.log("Printed in browsers and mobile apps");
}

if (Meteor.isCordova) {
  console.log("Printed only in mobile Cordova apps");

  //     MeteorCameraUI.getPicture({width: 500, height: 500, quality: 50}, function(error, data) {
  //       if (error) {
  //         throw error;
  //       }

  //       let image = document.getElementById('myImage');
  //       image.src = data;
  //     });
}

