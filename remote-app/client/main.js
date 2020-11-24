import { Template } from 'meteor/templating';

import './main.html';

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
            // serviceDiscovery = require("../plugins/cordova-plugin-discovery/www/serviceDiscovery");
        }
    }
});

if (Meteor.isCordova) {
    Template.ConnectESP.events({
        'click #connectESP' (event, instance) {
            console.log("ESP Clicked");

            // let serviceType = "ssdp:all";

            // let success = function(devices) {
            //     console.log(devices);
            // }

            // let failure = function() {
            //     alert("Error calling Service Discovery Plugin");
            // }
            // //
            // // /**
            // //  * Similar to the W3C specification for Network Service Discovery api 'http://www.w3.org/TR/discovery-api/'
            // //  * @method getNetworkServices
            // //  * @param {String} serviceType e.g. "urn:schemas-upnp-org:service:ContentDirectory:1", "ssdp:all", "urn:schemas-upnp-org:service:AVTransport:1"
            // //  * @param {Function} success callback an array of services
            // //  * @param {Function} failure callback
            // //  */
            // serviceDiscovery.getNetworkServices(serviceType, success, failure);
            // console.log("Done");

            // Configure zeroconf
            zeroconf.watch('_http._tcp.', 'local.', function(result) {
                let action = result.action;
                let service = result.service;
                if (action === 'added')
                {
                    console.log('service added', service);
                    console.log(service["domain"] + " : "+ service["hostname"] + " : " + service["ipv4Addresses"]);
                    if (service["hostname"] === ESP_SSID) {
                        ESP_IP = service["ipv4Addresses"];
                    }
                }
                else if (action === 'resolved')
                {
                    // console.log('service resolved', service);
                    // console.log(service["domain"] + " : "+ service["hostname"] + " : " + service["ipv4Addresses"]);
                    /* service : {
                    'domain' : 'local.',
                    'type' : '_http._tcp.',
                    'name': 'Becvert\'s iPad',
                    'port' : 80,
                    'hostname' : 'ipad-of-becvert.local',
                    'ipv4Addresses' : [ '192.168.1.125' ],
                    'ipv6Addresses' : [ '2001:0:5ef5:79fb:10cb:1dbf:3f57:feb0' ],
                    'txtRecord' : {
                        'foo' : 'bar'
                    } */
                }
                else {
                    console.log('service removed', service);
                }
            });


        }
    });
}


