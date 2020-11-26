import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import './main.html';

if (Meteor.isClient) {
  console.log("From Client");
}

Template.peerTable.onCreated(function peerTableOnCreated() {
  this.receiver_id = new ReactiveVar('');
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

    recvId = this.$("#receiver-id");
    status = this.$("#status");
    message = this.$("#message");
    sendMessageBox = this.$("#sendMessageBox");
    sendButton = this.$("#sendButton");
    clearMsgsButton = this.$("#clearMsgsButton");
    cueString = "<span class=\"cueMsg\">Cue: </span>";

    // Initialize the peer
    Template.peerTable.__helpers.get('initialize')();

});



Template.peerTable.helpers({
    receiver_id() {
        return Template.instance().receiver_id.get();
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
            instance.receiver_id.set(peer.id);
            instance.status.set("Awaiting connection...");
        });

        peer.on('connection', function (c) {
            // Allow only a single connection
            if (conn && conn.open) {
                c.on('open', function() {
                    c.send("Already connected to another client");
                    setTimeout(function() { c.close(); }, 500);
                });
                return;
            }

            conn = c;
            console.log("Connected to: " + conn.peer);
            // status.innerHTML = "Connected";
            instance.status.set("Connected");
            Template.peerTable.__helpers.get('ready')();
        });

        peer.on('disconnected', function () {
            // status.innerHTML = "Connection lost. Please reconnect";
            instance.status.set("Connection lost. Please reconnect");
            console.log('Connection lost. Please reconnect');

            // Workaround for peer.reconnect deleting previous id
            peer.id = lastPeerId;
            peer._lastServerId = lastPeerId;
            peer.reconnect();
        });

        peer.on('close', function() {
            conn = null;
            // status.innerHTML = "Connection destroyed. Please refresh";
            instance.status.set("Connection destroyed. Please refresh");
            console.log('Connection destroyed');
        });

        peer.on('error', function (err) {
            console.log(err);
            alert('' + err);
        });
    },

    /**
       * Triggered once a connection has been achieved.
       * Defines callbacks to handle incoming data and connection events.
    */
    ready() {
        const instance = Template.instance();
        conn.on('data', function (data) {
            console.log("Data recieved");
            let cueString = "<span class=\"cueMsg\">Cue: </span>";
            switch (data) {
                default:
                    Template.peerTable.__helpers.get('addMessage')("<span class=\"peerMsg\">Peer: </span>" + data);
                    break;
            };
        });

        conn.on('close', function () {
          instance.status.set("Connection reset<br>Awaiting connection...");
            conn = null;
        });
    },

    addMessage(msg) {
        const instance = Template.instance();
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
        instance.message.set(timeString + msg + instance.message.get());
    },

    clearMessages() {
        Template.instance().message.set("");
        Template.peerTable.__helpers.get('addMessage')("Msgs cleared");
    }
  
});


Template.peerTable.events({
    'click .initBtn' (event, instance) {
        console.log("clicked");
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
        // const msg = instance.sendMessageBox.get();
        const msg = instance.find('#sendMessageBox').value;
        instance.sendMessageBox.set("");
        conn.send(msg);
        console.log("Sent: " + msg)
        // addMessage("<span class=\"selfMsg\">Self: </span>" + msg);
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

