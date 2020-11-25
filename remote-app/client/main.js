import { Template } from 'meteor/templating';

import './main.html';

const parser = require('fast-xml-parser');
const he = require('he');

let zeroconf = null;
let serviceDiscovery = null;
let ESP_MAC = '';
let ESP_SSID = '';
let ESP_IP = '';

Meteor.startup(function() {
    if (Meteor.isCordova)
    {
        console.log("inside corodova app");
        // Here we can be sure the plugin has been initialized

        document.addEventListener("deviceready", onDeviceReady, false);

        // device APIs are available
        function onDeviceReady() {
            console.log("Device is ready now!");
            // Now safe to use device APIs
            zeroconf = cordova.plugins.zeroconf;
            zeroconf.watchAddressFamily = 'ipv4';
            // serviceDiscovery = cordova.plugins.serviceDiscovery;
            serviceDiscovery = require("../plugins/cordova-plugin-discovery/www/serviceDiscovery");
        }
    }
});

if (Meteor.isCordova) {
    Template.ConnectESP.events({
        'click #connectESP' (event, instance) {
            console.log("ESP Clicked");

            let serviceType = "ssdp:all";

            let success = function(devices) {
                console.log("Hi2");
                devices.forEach(device=>{
                    if (device["Server"] === "Arduino/1.0 UPNP/1.1 esp8266/"){
                        console.log(device["LOCATION"]); // http://192.168.1.13:80/description.xml
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
            console.log("Done");

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


