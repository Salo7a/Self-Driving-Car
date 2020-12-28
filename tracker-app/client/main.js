import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session'

import './main.html';
// import '../public/js/lanedetection'
import {detectEdges, showImage, showImageBGR, detectLineSegments, averageSlopeIntercept} from '../public/js/lanedetection'

let destID = '';

// code to run on server at startup
Meteor.startup(function() {
  if (Meteor.isCordova) 
  {
      // Here we can be sure the plugin has been initialized
        // Wait for device API libraries to load
        document.addEventListener("deviceready", onDeviceReady, false);

        // device APIs are available
        function onDeviceReady() {
            console.log("Device is ready now!");
            // Now safe to use device APIs
        }

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


Template.StreamArea.onRendered(function getVideoTag() {
    videoTag = Template.instance().find("video");
});

// Configurations for ImageArea Template
Template.ImagesArea.onCreated(function helloOnCreated() {
    // counter starts at 0
    this.img_src = new ReactiveVar('');
});

Template.ImagesArea.onRendered(function getImagesTags() {
    img1 = Template.instance().find("#img1");
    img2 = Template.instance().find("#img2");
    img3 = Template.instance().find("#img3");
    img4 = Template.instance().find("#img4");
    img5 = Template.instance().find("#img5");
    img6 = Template.instance().find("#img6");

    canvas1 = Template.instance().find("#canvas1");
    canvas2 = Template.instance().find("#canvas2");
    canvas3 = Template.instance().find("#canvas3");
    canvas4 = Template.instance().find("#canvas4");
    canvas5 = Template.instance().find("#canvas5");
    canvas6 = Template.instance().find("#canvas6");
});


Template.ImagesArea.helpers({
    img_src() {
        return Template.instance().img_src.get();
    },
});

Template.ImagesArea.events({
    'change input' (event, instance) {
        console.log("change input");
    },
    
    'click .testCV' (event, instance) {
        let matData = cv.imread(img1);
        showImage(canvas1, matData);

        // range of white in HSV
        console.log(matData.type());
        let lowScalar = new cv.Scalar(0, 0, 168, 255);
        let highScalar = new cv.Scalar(172, 111, 125, 255);
        let lowerWhite = new cv.Mat(matData.rows, matData.cols, matData.type(), lowScalar);
        let upperWhite = new cv.Mat(matData.rows, matData.cols, matData.type(), highScalar);
        // let lowerWhite = new cv.Mat(matData.rows, matData.cols, matData.type(), [0, 0, 168, 0]);
        // let upperWhite = new cv.Mat(matData.rows, matData.cols, matData.type(), [172, 111, 125, 255]);
        // let upperWhite = cv.matFromArray(1, 3, cv.CV_8UC4, [172, 111, 125]);
        
        console.log("lowerWhite", lowerWhite);
        console.log("upperWhite", upperWhite);
        // mat.delete();

        let {hsvMat, maskMat, edgesMat} = detectEdges(matData, lowerWhite, upperWhite);
        console.log(hsvMat, maskMat, edgesMat);
        showImage(canvas2, hsvMat);
        showImage(canvas3, maskMat);
        showImage(canvas4, edgesMat);
        let lines = detectLineSegments(edgesMat);
        console.log(lines);
        let segs = averageSlopeIntercept(matData, lines);
        console.log(segs);
        // showImage(canvas5, lines);
    },
});

Template.peerTable.onCreated(function peerTableOnCreated() {
    this.recvIdInput = new ReactiveVar('');
    this.status = new ReactiveVar('');
    this.message = new ReactiveVar('');
    this.sendMessageBox = new ReactiveVar('');
});

Template.peerTable.onRendered(function() {
    destID = "xdm24wjo09600";
    // init variables
    lastPeerId = null;
    peer = null; // Own peer object
    peerId = null;
    conn = null;

    recvIdInput = this.$("#receiver-id");
    status = this.$("#status");
    message = this.$("#message");
    sendMessageBox = this.$("#sendMessageBox");
    sendButton = this.$("#sendButton");
    clearMsgsButton = this.$("#clearMsgsButton");
    connectButton = this.$("#connect-button");
    connectStreamButton = this.$("#connect-stream-button");
    cueString = "<span class=\"cueMsg\">Cue: </span>";

    // Initialize the peer
    Template.peerTable.__helpers.get('initialize')();

    this.recvIdInput.set(destID);

});



Template.peerTable.helpers({
    recvIdInput() {
        return Template.instance().recvIdInput.get();
    },
    status() {
        return Template.instance().status.get();
    },
    message() {
        return Template.instance().message.get();
    },
    sendMessageBox() {
        return Template.instance().sendMessageBox.get();
    },

    /**
       * Create the Peer object for our end of the connection.
       *
       * Sets up callbacks that handle any events related to our
       * peer object.
    **/
    initialize () {
        // Template.instance() can't be used inside conn.on() listner
        // So I used it before the event
        const instance = Template.instance();
        g_instance = Template.instance();
        // Create own peer object with connection to shared PeerJS server
        peer = new Peer(null, {
            debug: 2
        });

        peer.on('open', function (id) {
            // Workaround for peer.reconnect deleting previous id
            if (peer.id === null) {
                console.log('Received null id from peer open');
                peer.id = lastPeerId;
            } else {
                lastPeerId = peer.id;
            }

            console.log('ID: ' + peer.id);
        });

        peer.on('connection', function (c) {
            // Disallow incoming connections
            c.on('open', function() {
                c.send("Sender does not accept incoming connections");
                setTimeout(function() { 
                    c.close();
                }, 500);
            });
        });

        peer.on('disconnected', function () {
            instance.status.set("Connection lost. Please reconnect");
            // Session.set('status', 'Connection lost. Please reconnect');
            console.log('Connection lost. Please reconnect');

            // Workaround for peer.reconnect deleting previous id
            peer.id = lastPeerId;
            peer._lastServerId = lastPeerId;
            peer.reconnect();
        });

        peer.on('close', function() {
            conn = null;
            instance.status.set("Connection destroyed. Please refresh");
            // Session.set('status', 'Connection destroyed. Please refresh');
            console.log('Connection destroyed');
        });

        peer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        });
    },

    /**
     * Create the connection between the two Peers.
     *
     * Sets up callbacks that handle any events related to the
     * connection and data received on it.
     */
    join() {
        const instance = Template.instance();

        // Close old connection
        if (conn) {
            conn.close();
        }

        // Create connection to destination peer specified in the input field
        conn = peer.connect(destID, {
            reliable: true
        });

        conn.on('open', function () {
            instance.status.set("Connected to: " + conn.peer);
            // Session.set('status', "Connected to: " + conn.peer);
            console.log("Connected to: " + conn.peer);

            // Check URL params for comamnds that should be sent immediately
            const command = getUrlParam("command");
            if (command) {
                conn.send(command);
            }
        });

        // Handle incoming data (messages only since this is the signal sender)
        conn.on('data', function (data) {
            console.log(data);
            Template.peerTable.__helpers.get('addMessage')("<span class=\"peerMsg\">Peer:</span> " + data);
        });

        conn.on('close', function () {
            instance.status.set("Connection closed")
            Session.set('status', 'Connection closed');
        });

        /**
         * Get first "GET style" parameter from href.
         * This enables delivering an initial command upon page load.
         *
         * Would have been easier to use location.hash.
         */
        function getUrlParam(name) {
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            let regexS = "[\\?&]" + name + "=([^&#]*)";
            let regex = new RegExp(regexS);
            let results = regex.exec(window.location.href);
            if (results == null)
                return null;
            else
                return results[1];
        };

        /**
         * Send a signal via the peer connection and add it to the log.
         * This will only occur if the connection is still alive.
         */
        function signal(sigName) {
            if (conn && conn.open) {
                conn.send(sigName);
                console.log(sigName + " signal sent");
                Template.peerTable.__helpers.get('addMessage')(cueString + sigName);
            } else {
                console.log('Connection is closed');
            }
        }
    },

    joinStream() {
        // Call a peer, providing our mediaStream
        const mediaStream = videoTag.srcObject;

        // Lane Detection In Mobile
        // Some Stuff here

        // Send result to ESP
        

        const call = peer.call(destID, mediaStream);

        // Emitted when a remote peer adds a stream.

        call.on('stream', function (stream) {
            console.log("added stream", stream);
        });

        // Handle call error
        call.on('error', function (err) {
            console.log(err);
            alert('' + err);
        });
    },

    addMessage(msg) {
        let now = new Date();
        let h = now.getHours();
        let m = addZero(now.getMinutes());
        let s = addZero(now.getSeconds());

        if (h > 12)
            h -= 12;
        else if (h === 0)
            h = 12;

        function addZero(t) {
            if (t < 10)
                t = "0" + t;
            return t;
        };
        const timeString = "<br><span class=\"msg-time\">" + h + ":" + m + ":" + s + "</span>  -  "
        g_instance.message.set(timeString + msg + g_instance.message.get());
    },

    clearMessages() {
        Template.instance().message.set("");
        Template.peerTable.__helpers.get('addMessage')("Msgs cleared");
    }
  
});


Template.peerTable.events({
    // Start peer connection on click
    'click #connect-button' (event, instance) {
        Template.peerTable.__helpers.get('join')();
        Template.peerTable.__helpers.get('joinStream')();
    },
    
    'keypress #sendMessageBox' (event, instance) {
      // const event = e || window.event;
      const char = event.which || event.keyCode;
      if (char == '13') {
        console.log("pressed enter");
        sendButton.click();
      }
    },

    'click #sendButton' (event, instance) {
      if (conn && conn.open) {
          let msg = instance.find('#sendMessageBox').value;
          instance.find('#sendMessageBox').value = "";
          conn.send(msg);
          console.log("Sent: " + msg)
          Template.peerTable.__helpers.get('addMessage')("<span class=\"selfMsg\">Self: </span>" + msg);
      } else {
          console.log('Connection is closed');
      }
    },

    // Clear messages box
    'click #clearMsgsButton' (event, instance) {
        Template.peerTable.__helpers.get('clearMessages')();
    },

});

