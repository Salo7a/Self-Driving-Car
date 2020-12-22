import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session'

const delay = require('delay');


import './main.html';

// let ESP_IP = 'http://192.168.43.66';
// let ESP_IP = '192.168.43.213';
let ESP_IP = "null";
let RFID_Reading = 'null';
let ultra1_reading = 'null';
let ultra2_reading = 'null';

let processInterval;            // for creating an interval to process frames iteratively
let output_frame;               // result frame after processing
let angle;                      // result angle after processing

let init_angle = 90;            // First SteeringAngle


// Control Arrows
let up_btn;
let down_btn;
let left_btn;
let right_btn;

const syncWait = ms => {
    const end = Date.now() + ms
    while (Date.now() < end) continue
}

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

    getData() {
        const getData = setInterval(function() {
            send_ajax(ESP_IP+'/data', "Getting Data From ESP..").then((data) => {
                console.log(data);
                data = data.split(',')
                RFID_Reading = data[0];
                ultra1_reading = data[1];
                ultra2_reading = data[2];
                Session.set('rfidReading', RFID_Reading);
                Session.set('ultra1_reading', ultra1_reading);
                Session.set('ultra2_reading', ultra2_reading);
            });
        }, 500);
        getData;
        
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

Template.DrivingMode.onRendered(() => {
    Session.set('autoMode', false);
});

Template.DrivingMode.helpers({
    autoMode(){
      return Session.get('autoMode');
    }
});


// ControlArrows Template Configurations
Template.ControlArrows.onRendered(function getTags() {
    up_btn    = Template.instance().find(".up");
    down_btn  = Template.instance().find(".down");
    left_btn  = Template.instance().find(".left");
    right_btn = Template.instance().find(".right");
});

Template.ControlArrows.events({
    'mousedown/keydown .up, touchstart .up' (e, i) {
        send_ajax(ESP_IP + '/forward', "Moving Forward..");
        Session.set('order', 'forward');
    },

    'mousedown/keydown .down, touchstart .down' (e, i) {
        send_ajax(ESP_IP + '/backward', "Moving Backward..");
        Session.set('order', 'backward');
    },

    'mousedown/keydown .right, touchstart .right' (e, i) {
        send_ajax(ESP_IP + '/right', "Moving Right..");
        Session.set('order', 'right');
    },
    
    'mousedown/keydown .left, touchstart .left' (e, i) {
        send_ajax(ESP_IP + '/left', "Moving Left..");
        Session.set('order', 'left');
    },

    'mouseup/keyup .arrow-key, touchend .arrow-key' (e, i) {
        // Stop the car
        send_ajax(ESP_IP + '/stop', "Moving Stop..");
        Session.set('order', 'stop');
    },
});

Template.AutoModeButtons.events({
    // Ajax For Handling play and pause in AutoMode
    'mousedown/keydown #play, touchstart #play' (e, i) {
        send_ajax(ESP_IP + '/play', "Start Moving The Car in Auto Mode...");

        // Start Processing The Stream
        processInterval = setInterval(Template.StreamArea.__helpers.get('startProcessing'), 1000);
    },

    'mousedown/keydown #pause, touchstart #pause' (e, i) {
        Template.StreamArea.__helpers.get('stopProcessing')();
        send_ajax(ESP_IP + '/stop', "Stop The Car...");
        Session.set('order', 'stop');
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
        let url_path = 'http://127.0.0.1:5000/detect?currentAngle='+ init_angle + '&color=blue&frame_uri=' + frameURI_encoded;
        
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
                init_angle = angle;
            },
            tryCount: 0,
            retryLimit: 5,
            error: function (xhr, textStatus, errorThrown) {
                if (textStatus === 'timeout') {
                    this.tryCount++;
                    toastr.error("Error! " + xhr.status + " " + textStatus + ", Retrying");
                    if (this.tryCount <= this.retryLimit) {
                        //try again
                        $.ajax(this);
                        return;
                    }
                    return;
                }
                if (xhr.status === 500) {
                    toastr.error("Error! " + xhr.status + " " + textStatus);
                } else {
                    toastr.error("Error! " + xhr.status + " " + textStatus);
                }
            },
        }).responseText;

        return {output_frame, angle};
    },

    startProcessing() {
        let frameURI = Template.StreamArea.__helpers.get("getFrame")(); 
        let {output_frame, angle} = Template.StreamArea.__helpers.get("processFrame")(frameURI);
        let order;
        processedImage.src = output_frame;
        Session.set('angle', angle);

        // Conditions on angle to choose which direction to send Ajax to ESP
        if (angle > 108) {
            order = "/right";
        } else if (angle <= 75) {
            order = "/left";
        } else if (angle > 76 && angle < 109) {
            order = "/forward";
        }

        // Check objects
        if (ultra1_reading < 100 && ultra2_reading < 100) {
            // Stuff here
        } else {

        }

        // Send ajax to move the car
        send_ajax(ESP_IP + order, "Agnle: " + angle + " Order: " + order);
        Session.set('order', order);
        (async () => {
            await delay(600);
            send_ajax(ESP_IP + '/stop', "Order: stop");
            Session.set('order', 'stop');
        })();
        // send_ajax(ESP_IP + '/stop', "Order: stop");
        
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
    Session.set('order', 'null');
});

Template.ProcessedArea.onRendered(function getImageTag() {
    processedImage = Template.instance().find("#processed_img");
});

Template.ProcessedArea.helpers({
    angle() {
        return Session.get('angle');
    },
    order() {
        return Session.get('order');
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
            peerID = 'xdm24wjo00360';
        } else {
            peerID = 'xdm24wjo09200';
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
    // Connect ESP Configuration
    Template.ConnectESP.events({
        'click #connectESP' (event, instance) {
            console.log("Connecting to ESP...");

            let serviceType = "ssdp:all";

            let success = function(devices) {
                console.log("success, serching..");
                console.log(JSON.stringify(devices));
                devices.forEach(device => {
                    console.log(device["Server"]);
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

                        Template.ConnectESP.__helpers.get('getData')();
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
} else {
    Template.ConnectESP.events({
        'click #connectESP' (event, instance) {
            console.log("Connecting to ESP...");
    
            // Send ESP_IP to server-side
            Meteor.call("scanESP", null, async (error, result) => {
                if (error) throw error;
                ESP_IP = await result;
                console.log("ESP in client: ", ESP_IP);
                // if ESP_IP was found successfully
                if (ESP_IP === "null") {
                    // Add Failure Component to UI 
                    Session.set('espConnected', '2');
                    console.log("Connection Failed: ");
                } else {
                    // Add Success Component to UI
                    Session.set('espConnected', '1');
                    (async () => {
                        await delay(500);
                        Session.set('espConnected', '0');
                    })();

                    console.log("Connected Successfully: ", ESP_IP);
                    Template.ConnectESP.__helpers.get('getData')();
                    
                }
            });
            
        }
    });
}





// Helper Functions
const send_ajax = async (url, message) => {
    let response_data;
    await $.ajax({
        url: url,
        success: function (data) {
            console.log(message);
            response_data = data;
        },
        crossDomain: true,
        tryCount: 0,
        retryLimit: 8,
        error: function (xhr, textStatus, errorThrown) {
            if (textStatus === 'timeout') {
                this.tryCount++;
                toastr.error("Error! " + xhr.status + " " + textStatus + ", Retrying");
                if (this.tryCount <= this.retryLimit) {
                    //try again
                    $.ajax(this);
                    return;
                }
                return;
            }
            if (xhr.status === 500) {
                toastr.error("Error! " + xhr.status + " " + textStatus);
            } else {
                toastr.error("Error! " + xhr.status + " " + textStatus);
            }
        },
    });

    return response_data;
}


// keydown Events to control the car with arrows
window.addEventListener("keydown", function (event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
  
    switch (event.key) {
        case "ArrowUp":
            up_btn.dispatchEvent(new Event("mousedown"));
            break;

        case "ArrowDown":
            down_btn.dispatchEvent(new Event("mousedown"));
            break;        

        case "ArrowLeft":
            left_btn.dispatchEvent(new Event("mousedown"));
            break;

        case "ArrowRight":
            right_btn.dispatchEvent(new Event("mousedown"));
            break;

        default:
            return; // Quit when this doesn't handle the key event.
    }
  
    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
  }, true);


// keyup Events to control the car with arrows
window.addEventListener("keyup", function (event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event was already processed
    }

    switch (event.key) {
        case "ArrowUp":
            up_btn.dispatchEvent(new Event("mouseup"));
            break;

        case "ArrowDown":
            down_btn.dispatchEvent(new Event("mouseup"));
            break;

        case "ArrowLeft":
            left_btn.dispatchEvent(new Event("mouseup"));
            break;

        case "ArrowRight":
            right_btn.dispatchEvent(new Event("mouseup"));
            break;

        default:
            return; // Quit when this doesn't handle the key event.
    }

    // Cancel the default action to avoid it being handled twice
    event.preventDefault();
}, true);