import { Template } from 'meteor/templating';

import './main.html';

// let zeroconf = cordova.plugins.zeroconf;
// zeroconf.watchAddressFamily = 'ipv4';

// const serviceDiscovery = require("../plugins/cordova-plugin-discovery/www/serviceDiscovery");
let WifiWizard2 = null;
let ESP_MAC = '';
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
            WifiWizard2 = require("../plugins/cordova-plugin-wifiwizard2/www/WifiWizard2");
            // let WifiManager = require("../plugins/cordova-plugin-android-wifi-manager/www/index");
            // let zeroconf = require("../plugins/cordova-plugin-zeroconf/www/zeroconf");
            // zeroconf.watchAddressFamily = 'ipv4';
            //
            // // Configure zeroconf
            // zeroconf.watch('_http._tcp.', 'local.', function(result) {
            //     let action = result.action;
            //     let service = result.service;
            //     if (action === 'added')
            //     {
            //         console.log('service added', service);
            //     }
            //     else if (action === 'resolved')
            //     {
            //         console.log('service resolved', service);
            //         $("p").text = service;
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

            // let serviceType = "ssdp:all";
            // let success = function(devices) {
            //     console.log(devices);
            // }
            //
            // let failure = function() {
            //     alert("Error calling Service Discovery Plugin");
            // }
            //
            // serviceDiscovery.getNetworkServices(serviceType, success, failure);
        }
    }
});

if (Meteor.isCordova) {
    Template.ConnectESP.events({
        'click #connectESP' (event, instance) {
            console.log("ESP Clicked");
            WifiWizard2.requestPermission().then(r => console.log(r))
                .catch(e => console.log(e));

            WifiWizard2.getConnectedBSSID().then(r => console.log(r))
                .catch(e => console.log(e));

            WifiWizard2.getWifiIP().then(r => console.log("STUDBME2 IP " + r))
                .catch(e => console.log(e));

            // WifiWizard2.listNetworks().then(r => console.log(r))
            //     .catch(e => console.log(e));

            WifiWizard2.scan({}).then(function (results) {
                // console.log(results);
                WifiWizard2.getScanResults({}).then((networks) => {
                    // console.log(networks);
                    networks.forEach(net => {
                        console.log(net["SSID"]);
                        console.log(net["BSSID"]);
                        if (net["BSSID"] === ESP_MAC) {
                            // ESP_IP = net["BSSID"];
                        }
                    });
                }).catch((e) => {
                    console.log("Error ", e);
                });
            }).catch(e => console.log( 'Error getting results!', e ));

            // let serviceType = "ssdp:all";
            // let success = function(devices) {
            //   console.log(devices);
            // }
            //
            // let failure = function() {
            //     alert("Error calling Service Discovery Plugin");
            // }
            //
            // serviceDiscovery.getNetworkServices(serviceType, true, success, failure);

            WifiWizard2.connect("StudBME1");
            WifiWizard2.getWifiIP().then(r => console.log("StudBME1 IP " + r))
                .catch(e => console.log(e));
        }
    });
}


