import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

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
}

Template.peerTable.onCreated(function peerTableOnCreated() {
  this.recvIdInput = new ReactiveVar('');
  this.status = new ReactiveVar('');
  this.message = new ReactiveVar('');
  this.sendMessageBox = new ReactiveVar('');
});

Template.peerTable.onRendered(function() {
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
    cueString = "<span class=\"cueMsg\">Cue: </span>";

    // Initialize the peer
    Template.peerTable.__helpers.get('initialize')();

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
            console.log('Connection lost. Please reconnect');

            // Workaround for peer.reconnect deleting previous id
            peer.id = lastPeerId;
            peer._lastServerId = lastPeerId;
            peer.reconnect();
        });

        peer.on('close', function() {
            conn = null;
            instance.status.set("Connection destroyed. Please refresh");
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
        const destID = Template.instance().find('#receiver-id').value;

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
            // status.innerHTML = "Connection closed";
            instance.status.set("Connection closed")
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
        Template.instance().message.set(timeString + msg + Template.instance().message.get());
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

