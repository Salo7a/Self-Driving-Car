import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session'

import './main.html';

let ESP_MAC = '2c:f4:32:71:5b:b7';
let ESP_SSID = '';
let ESP_IP = 'http://192.168.43.66';
let RFID_Reading = 'null';
let ultra1_reading = 'null';
let ultra2_reading = 'null';


let processInterval;            // for creating an interval to process frames iteratively
let output_frame;               // result frame after processing
let angle;                      // result angle after processing


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
            // serviceDiscovery = cordova.plugins.serviceDiscovery;
            // serviceDiscovery = require("../plugins/cordova-plugin-discovery/www/serviceDiscovery");
        }
    }
});


// ConnectESP Template Configurations
Template.ConnectESP.onCreated(() => {
    Session.set('espConnected', '0');
    Session.set('rfidReading', RFID_Reading);
    Session.set('ultra1_reading', ultra1_reading);
    Session.set('ultra2_reading', ultra2_reading);
});

Template.ConnectESP.helpers({
    espConnected() {
        return Session.get('espConnected');
    },

    rfidReading() {
        return Session.get('rfidReading');
    },

    ultra1_reading() {
        return Session.get('ultra1_reading');
    },

    ultra2_reading() {
        return Session.get('ultra2_reading');
    },

    isPending(state) {
        return state === '0';
    },

    isConnected(state) {
        return state === '1';
    },

    isDisconnect(state) {
        return state === '2';
    },

    getRFIDReadings() {
        let RFID_Reading = Template.ConnectESP.__helpers.get('rfidReading')();

        // Send a GET request to retrieve RFID readings every 1 second
        const getRFID = setInterval(function() {
            console.log("request RFID Readings..");
            $.ajax({
                url: ESP_IP + '/rfid',
                success: (data) => {
                    console.log("Get RFID..");
                    console.log(data);
                    RFID_Reading = data;
                }
            });
            Session.set('rfidReading', RFID_Reading);
            console.log("RFID: ...");
        }, 500);

        getRFID;
    },

    getUltra1Reading() {
        let ultra1_reading = Template.ConnectESP.__helpers.get('ultra1_reading')();

        // Send a GET request to retrieve ultra1 reading every 100ms
        const getUltra1 = setInterval(function() {
            console.log("request Ultra1 Readings..");
            $.ajax({
                url: ESP_IP + '/ultra1',
                success: (data) => {
                    console.log("Get Ultra1..");
                    console.log(data);
                    ultra1_reading = data;
                }
            });
            Session.set('ultra1_reading', ultra1_reading);
            console.log("Ultra1: ...");
        }, 100);

        getUltra1;
    },

    getUltra2Reading() {
        let ultra2_reading = Template.ConnectESP.__helpers.get('ultra2_reading')();

        // Send a GET request to retrieve ultra2 reading every 100ms
        const getUltra2 = setInterval(function() {
            console.log("request Ultra2 Readings..");
            $.ajax({
                url: ESP_IP + '/ultra2',
                success: (data) => {
                    console.log("Get Ultra2..");
                    console.log(data);
                    ultra1_reading = data;
                }
            });
            Session.set('ultra2_reading', ultra2_reading);
            console.log("Ultra2: ...");
        }, 100);

        getUltra2;
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
    'mousedown .up, touchstart .up' (e, i) {
        console.log("up");
        $.ajax({
            url: ESP_IP + '/forward',
            success: () => {
                console.log("Moving Forward..");
            }
        });
    },

    'mousedown .down, touchstart .down' (e, i) {
        console.log("down");
        $.ajax({
            url: ESP_IP + '/back',
            success: () => {
                console.log("Moving Backward..");
            }
        });
    },

    'mousedown .right, touchstart .right' (e, i) {
        console.log("right");
        $.ajax({
            url: ESP_IP + '/right',
            success: () => {
                console.log("Moving Right..");
            }
        });
    },
    
    'mousedown .left, touchstart .left' (e, i) {
        console.log("left");
        $.ajax({
            url: ESP_IP + '/left',
            success: () => {
                console.log("Moving Left..");
            }
        });
    },

    'mouseup .arrow-key, touchend .arrow-key' (e, i) {
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

        processInterval = setInterval(Template.StreamArea.__helpers.get('startProcessing'), 250);
    },

    'mousedown #pause' (e, i) {
        console.log("pause clicked");
        Template.StreamArea.__helpers.get('stopProcessing')();

        $.ajax({
            url: ESP_IP + '/stop',
            success: () => {
                console.log("Stop The Car...");
            }
        });

    },
});


// Configurations for StreamArea Template
Template.StreamArea.onRendered(function getStreamTags() {
    videoTag = Template.instance().find("video");
    canvasTag = Template.instance().find("canvas");
    screenshotImage = Template.instance().find(".screenshot-image");
    playBtn = Template.instance().find(".playBtn");
    pauseBtn = Template.instance().find(".pauseBtn");
    screenshotBtn = Template.instance().find(".screenshotBtn");
});


Template.StreamArea.helpers({
    handleStream(stream) {
        console.log("handling stream..");
        videoTag.srcObject = stream;
        videoTag.play();
        playBtn.classList.add('d-none');
        pauseBtn.classList.remove('d-none');
        screenshotBtn.classList.remove('d-none');
        streamStarted = true;
    },

    playStream() {
        console.log("playing stream");
        if (streamStarted) {
            videoTag.play();
            playBtn.classList.add('d-none');
            pauseBtn.classList.remove('d-none');
        }
    },

    pauseStream() {
        console.log("pausing stream..")
        videoTag.pause();
        playBtn.classList.remove('d-none');
        pauseBtn.classList.add('d-none');
    },

    doScreenshot() {
        console.log("Taking Screenshoot..");
        canvasTag.width = videoTag.videoWidth;
        canvasTag.height = videoTag.videoHeight;
        canvasTag.getContext('2d').drawImage(videoTag, 0, 0);
        let imgURI = canvasTag.toDataURL('image/jpeg', 0.5);
        screenshotImage.src = imgURI
        screenshotImage.classList.remove('d-none');
        return imgURI
    },

    getFrame() {
        canvasTag.width = videoTag.videoWidth;
        canvasTag.height = videoTag.videoHeight;
        canvasTag.getContext('2d').drawImage(videoTag, 0, 0);
        return canvasTag.toDataURL('image/jpeg', 0.5);
    },

    processFrame(frameURI) {
        // Percent-Encode for Reserved characters in URL
        let frameURI_encoded = encodeURIComponent(frameURI);
        let url_path = 'http://127.0.0.1:5000/detect?color=blue&frame_uri=' + frameURI_encoded;
        
        // Send GET request to Flask server for processing
        // Params: color and frame_uri(base64)
        $.ajax({
            type: "GET",
            url: url_path,
            async: false,
            success: (data) => {
                // console.log(JSON.stringify(data));
                output_frame = data['frame_uri'];
                angle = data['angle'];
            },
            error: (err) => {
                console.log(err)
            }
        }).responseText;

        return {output_frame, angle};
    },

    startProcessing() {
        let frameURI = Template.StreamArea.__helpers.get("getFrame")(); 
        let {output_frame, angle} = Template.StreamArea.__helpers.get("processFrame")(frameURI);
        let order = '/stop';
        processedImage.src = output_frame;
        Session.set('angle', angle);

        // Conditions on angle to choose which direction to send Ajax to ESP
        // Some Stuff here

        if (angle > 100) {
            console.log("order is: ", order);
            order = "/right"
        } else if (angle < 80) {
            console.log("order is: ", order);
            order = "/left"
        } else if (angle > 79 && angle < 101) {
            console.log("order is: ", order);
            order = "/forward"
        }

        const sendAJAX = (val) => {
            $.ajax({
                url: ESP_IP + val,
                // async: false,
                success: () => {
                    console.log("Sent order: ", val);
                }
            });
        }

        // Send ajax to the car
        $.ajax({
            url: ESP_IP + order,
            // async: false,
            success: () => {
                console.log("Sent order: ", order);
            }
        });

        // Send ajax to the car
        $.ajax({
            url: ESP_IP + '/stop',
            success: () => {
                console.log("Sent order: stop");
            }
        });
    },

    stopProcessing() {
        console.log("Stopping Processing");
        clearInterval(processInterval);
    },

});

Template.StreamArea.events({
    // Handle click play Button event in the stream
    'click .playBtn' (event, instance) {
        console.log("clicked play");
        Template.StreamArea.__helpers.get('playStream')();
    },

    // Handle click pause Button event in the stream
    'click .pauseBtn' (event, instance) {
        console.log("clicked pause");
        Template.StreamArea.__helpers.get('pauseStream')();

    },

    // Handle click screenshot Button event in the stream
    'click .screenshotBtn' (event, instance) {
        console.log("clicked screenshot");
        Template.StreamArea.__helpers.get('doScreenshot')();
    },
});


// Configurations for ProcessedArea Template
Template.ProcessedArea.onCreated(() => {
    Session.set('angle', 'null');
});


Template.ProcessedArea.onRendered(function getImageTag() {
    processedImage = Template.instance().find("#processed_img");
});

Template.ProcessedArea.helpers({
    angle() {
        return Session.get('angle');
    },
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
        if(Meteor.isCordova){
            peerID = 'xdm24wjo00365';
        } else{
            peerID = 'xdm24wjo00324';
        }
        
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
            // if (conn && conn.open) {
            //     c.on('open', function() {
            //         c.send("Already connected to another client");
            //         setTimeout(function() { c.close(); }, 500);
            //     });
            //     return;
            // }

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
                // Start Stream Process
                Template.StreamArea.__helpers.get('handleStream')(stream);
                console.log("stream in client", stream);
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
          console.log("Sent: " + msg);
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


// Code to be executed in mobile app only
if (Meteor.isCordova) {
    Template.ConnectESP.events({
        'click #connectESP' (event, instance) {
            console.log("Connecting to ESP...");

            let serviceType = "ssdp:all";

            let success = function(devices) {
                console.log("success, serching..");
                devices.forEach(device => {
                    console.log(device);
                    if (device["Server"] === "Arduino/1.0 UPNP/1.1 esp8266/") {
                        let loc = device["LOCATION"];
                        console.log(device["LOCATION"]); // http://192.168.1.13:80/description.xml
                        ESP_IP = loc.slice(0, loc.search(":80"));
                        console.log(ESP_IP);

                        // Add Success Component to UI
                        Session.set('espConnected', '1');

                        // Send ESP_IP to server-side
                        Meteor.call("sendESPIP", ESP_IP, (error, result) => {
                            if (error) throw error;
                            console.log(result);
                        });

                        Template.ConnectESP.__helpers.get('getRFIDReadings')();
                        Template.ConnectESP.__helpers.get('getUltra1Reading')();
                        Template.ConnectESP.__helpers.get('getUltra2Reading')();
                    }
                });

                if (ESP_IP === 'null') {
                    // Add Failure Component to UI 
                    Session.set('espConnected', '2');
                }
            }
               
            let failure = function() {
                alert("Error calling Service Discovery Plugin");
            }
            
            // /**
            //  * Similar to the W3C specification for Network Service Discovery api 'http://www.w3.org/TR/discovery-api/'
            //  * @method getNetworkServices
            //  * @param {String} serviceType e.g. "urn:schemas-upnp-org:service:ContentDirectory:1", "ssdp:all", "urn:schemas-upnp-org:service:AVTransport:1"
            //  * @param {Function} success callback an array of services
            //  * @param {Function} failure callback
            //  */
            serviceDiscovery.getNetworkServices(serviceType, success, failure);

        }
    });
}


