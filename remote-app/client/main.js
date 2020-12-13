import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session'

import './main.html';
import { data } from 'jquery';

let ESP_MAC = '2c:f4:32:71:5b:b7';
let ESP_SSID = '';
let ESP_IP = 'null';
let RFID_Reading = 'null';
let output_angle;

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
});

Template.ConnectESP.helpers({
    espConnected() {
        return Session.get('espConnected');
    },

    rfidReading() {
        return Session.get('rfidReading');
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

        // const processInterval = setInterval(Template.StreamArea.__helpers.get('startProcessing')(), 1000);
        // setInterval(Template.StreamArea.__helpers.get('startProcessing')(), 1000);
        setInterval(() => {
            console.log("interval done");
            Template.StreamArea.__helpers.get('startProcessing')();
        }, 100);
        // processInterval;
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
        let imgSrc = canvasTag.toDataURL('image/jpeg', 0.5);
        let imgTag = screenshotImage;
        // screenshotImage.src = imgSrc
        screenshotImage.classList.remove('d-none');
        return {imgSrc, imgTag}
    },

    getFrame() {
        canvasTag.width = videoTag.videoWidth;
        canvasTag.height = videoTag.videoHeight;
        canvasTag.getContext('2d').drawImage(videoTag, 0, 0);
        return canvasTag.toDataURL('image/jpeg', 0.5);
    },

    processFrame(frameData) {
        let output = 100;
        // Use Function from lanedetection.js
        // console.log(frameData);

        // Send frameData to server-side for processing
        Meteor.call("sendImgURI", frameData, async (error, result) => {
            await console.log("finished call sendImgURI from client");
            if (error) throw error;
            console.log(result);
        });

        return output;
    },

    startProcessing() {
        let frame = Template.StreamArea.__helpers.get("getFrame")(); 
        let angle = Template.StreamArea.__helpers.get("processFrame")(frame);
        let order;
        // console.log("frame: ", frame);
        console.log("angle: ", angle);
        screenshotImage.classList.remove('d-none');
        screenshotImage.src = frame;
        // Conditions in angle to send Ajax to ESP
        // Some Stuff here
        if (angle > 95) {
            order = "/forward"
        } else if (angle < 80) {
            order = "/back"
        }

        $.ajax({
            url: ESP_IP + order,
            success: () => {
                console.log("Sent order");
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
        let imgVars = Template.StreamArea.__helpers.get('doScreenshot')();
        let imgSrc = imgVars.imgSrc;
        let imgTag = imgVars.imgTag;
        // console.log("src: ", imgSrc);

        // Send imgData to server-side for processing
        let imgSrcEnc = encodeURIComponent(imgSrc);
        let url_path = 'http://127.0.0.1:5000/detect?color=blue&frame_uri=' + imgSrcEnc;

        $.ajax({
            url: url_path,
            success: (data) => {
                console.log("Send Image Data..");
                // console.log(JSON.stringify(data));
                screenshotImage.src = data['imgBase'];
            },
            error: (err) => {
                console.log(err)
            }
        });

        // Do conditions for the angle


        // Send ajax to the car



        // Meteor.call("sendImgURI", imgSrc, (error, result) => {
        //     if (error) throw error;
        //     // console.log(error);
        //     console.log(result);
        //     console.log("finished call sendImgURI from client");
        // });
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
                // Start Stream Process
                Template.StreamArea.__helpers.get('handleStream')(stream);
                console.log("stream in client", stream);

                // Send Stream to server-side for processing
                // Meteor.call("getStream", stream, async (error, result) => {
                //     await console.log("finished call from client");
                //     if (error) throw error;
                //     console.log(result);
                // });
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


Meteor.methods({
    sendAngle(angle) {
        output_angle = angle;
        console.log(output_angle);
    },
});

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
                        Session.set('espConnected', '1');

                        // Send ESP_IP to server-side
                        Meteor.call("sendESPIP", ESP_IP, async (error, result) => {
                            await console.log("finished call from client");
                            if (error) throw error;
                            console.log(result);
                        });

                        Template.ConnectESP.__helpers.get('getRFIDReadings')();
                    }
                });

                if (ESP_IP === 'null') {
                    Session.set('espConnected', '2');
                }
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


