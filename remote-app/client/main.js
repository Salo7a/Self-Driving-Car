import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session'

import './main.html';

const parser = require('fast-xml-parser');
const he = require('he');

let serviceDiscovery = null;
let ESP_MAC = '2c:f4:32:71:5b:b7';
let ESP_SSID = '';
let ESP_IP = 'http://192.168.1.13';

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
            serviceDiscovery = require("../plugins/cordova-plugin-discovery/www/serviceDiscovery");
        }
    }
});

// DrivingMode Template Configurations
Template.DrivingMode.events({
    'click #drive-mode' (e, i) {
        if (Template.instance().$('#option1').is(':checked')){
            Session.set('autoMode', false);
        } else if (Template.instance().$('#option2').is(':checked')){
            Session.set('autoMode', true);
        }
    },
});


// ConnectESP Template Configurations
Template.ConnectESP.onCreated(() => {
    Session.set('espConnected', '0');
});

Template.ConnectESP.helpers({
    espConnected() {
        return Session.get('espConnected');
    },

    isPending(state) {
        return state === '0';
    },

    isConnected(state) {
        return state === '1';
    },

    isDisconnect(state) {
        return state === '2';
    }
});

// Controls Template Configurations
Template.Controls.onRendered(() => {
    Session.set('autoMode', false);
});

Template.Controls.helpers({
    autoMode(){
      return Session.get('autoMode');
    }
});

// ControlArrows Template Configurations
Template.ControlArrows.events({
    'mousedown .up' (e, i) {
        console.log("up");
        $.ajax({
            url: ESP_IP + '/forward',
            success: () => {
                console.log("Moving Forward..");
            }
        });
    },
    'mousedown .down' (e, i) {
        console.log("down");
        $.ajax({
            url: ESP_IP + '/back',
            success: () => {
                console.log("Moving Backward..");
            }
        });
    },
    'mousedown .right' (e, i) {
        console.log("right");
        $.ajax({
            url: ESP_IP + '/right',
            success: () => {
                console.log("Moving Right..");
            }
        });
    },
    'mousedown .left' (e, i) {
        console.log("left");
        $.ajax({
            url: ESP_IP + '/left',
            success: () => {
                console.log("Moving Left..");
            }
        });
    },

    'mouseup .up, mouseup .down, mouseup .right, mouseup .left' (e, i) {
        // Stop the car
        console.log("stop");
        $.ajax({
            url: ESP_IP + '/stop',
            success: () => {
                console.log("Stop Car..");
            }
        });
    },

});

Template.AutoModeButtons.events({
    // Ajax For Handling play and pause in AutoMode
    // Send GET request to /play
    'mousedown #play' (e, i) {
        console.log("play clicked");
        $.ajax({
            url: ESP_IP + '/play',
            success: () => {
                console.log("Start Moving The Car in Auto Mode...");
            }
        });
    },

    'mousedown #pause' (e, i) {
        console.log("pause clicked");
        $.ajax({
            url: ESP_IP + '/stop',
            success: () => {
                console.log("Stop The Car...");
            }
        });
    },
});



// Configurations for StreamArea Template
Template.StreamArea.onRendered(function getVideoTag() {
    videoTag = Template.instance().find("video");
    console.log(videoTag);
});

// Configurations for peerTable Template
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
        g_instance = Template.instance();
        // Create own peer object with connection to shared PeerJS server
        peerID = 'xdm24wjo00324';
        peer = new Peer(peerID, {
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
            instance.status.set("Connected");
            Template.peerTable.__helpers.get('ready')();
        });

        // Answer Call
        peer.on('call', function(call) {
            // Answer the call, providing our mediaStream
            // call.answer(mediaStream);
            call.answer();

            call.on('stream', function(stream) {
                videoTag.srcObject = stream;
                console.log(stream);
                videoTag.play();
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
          const msg = instance.find('#sendMessageBox').value;
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





if (Meteor.isCordova) {
    Template.ConnectESP.events({
        'click #connectESP' (event, instance) {
            console.log("Connecting to ESP...");

            let serviceType = "ssdp:all";

            let success = function(devices) {
                devices.forEach(device=>{
                    if (device["Server"] === "Arduino/1.0 UPNP/1.1 esp8266/"){
                        let loc = device["LOCATION"];
                        console.log(device["LOCATION"]); // http://192.168.1.13:80/description.xml
                        ESP_IP = loc.slice(0, loc.search(":80"));
                        console.log(ESP_IP);
                    }

                    // let options = {
                    //     attributeNamePrefix : "@_",
                    //     attrNodeName: "attr", //default is 'false'
                    //     textNodeName : "#text",
                    //     ignoreAttributes : true,
                    //     ignoreNameSpace : false,
                    //     allowBooleanAttributes : false,
                    //     parseNodeValue : true,
                    //     parseAttributeValue : false,
                    //     trimValues: true,
                    //     cdataTagName: "__cdata", //default is 'false'
                    //     cdataPositionChar: "\\c",
                    //     parseTrueNumberOnly: false,
                    //     arrayMode: false, //"strict"
                    //     attrValueProcessor: (val, attrName) => he.decode(val, {isAttributeValue: true}),//default is a=>a
                    //     tagValueProcessor : (val, tagName) => he.decode(val), //default is a=>a
                    //     stopNodes: ["parse-me-as-string"]
                    // };
                    // if( parser.validate(device["xml"]) === true) { //optional (it'll return an object in case it's not valid)
                    //     let jsonObj = parser.parse(device["xml"],options);
                    //     console.log(JSON.stringify(jsonObj));
                    //     if (jsonObj["device"]["friendlyName"] === "CoolESP"){
                    //         console.log(JSON.stringify(jsonObj));
                    //
                    //     }
                    // }
                })
                }
            let failure = function() {
                alert("Error calling Service Discovery Plugin");
            }
            //
            // /**
            //  * Similar to the W3C specification for Network Service Discovery api 'http://www.w3.org/TR/discovery-api/'
            //  * @method getNetworkServices
            //  * @param {String} serviceType e.g. "urn:schemas-upnp-org:service:ContentDirectory:1", "ssdp:all", "urn:schemas-upnp-org:service:AVTransport:1"
            //  * @param {Function} success callback an array of services
            //  * @param {Function} failure callback
            //  */
            serviceDiscovery.getNetworkServices(serviceType, success, failure);

            // Configure zeroconf
            // zeroconf.watch('_http._tcp.', 'local.', function(result) {
            //     let action = result.action;
            //     let service = result.service;
            //     console.log(JSON.stringify(result));
            //     if (action === 'added')
            //     {
            //         console.log('service added', service);
            //         console.log(service["domain"] + " : "+ service["hostname"] + " : " + service["ipv4Addresses"]);
            //         if (service["hostname"] === ESP_SSID) {
            //             ESP_IP = service["ipv4Addresses"];
            //         }
            //     }
            //     else if (action === 'resolved')
            //     {
            //         // console.log('service resolved', service);
            //         // console.log(service["domain"] + " : "+ service["hostname"] + " : " + service["ipv4Addresses"]);
            //         /* service : {
            //         'domain' : 'local.',
            //         'type' : '_http._tcp.',
            //         'name': 'Becvert\'s iPad',
            //         'port' : 80,
            //         'hostname' : 'ipad-of-becvert.local',
            //         'ipv4Addresses' : [ '192.168.1.125' ],
            //         'ipv6Addresses' : [ '2001:0:5ef5:79fb:10cb:1dbf:3f57:feb0' ],
            //         'txtRecord' : {
            //             'foo' : 'bar'
            //         } */
            //     }
            //     else {
            //         console.log('service removed', service);
            //     }
            // });


        }
    });
}



