import { Template } from 'meteor/templating';

import './main.html';

// let zeroconf = cordova.plugins.zeroconf;
// zeroconf.watchAddressFamily = 'ipv4';

const serviceDiscovery = require("../plugins/cordova-plugin-discovery/www/serviceDiscovery");
const WifiWizard2 = require("../plugins/cordova-plugin-wifiwizard2/www/WifiWizard2");
console.log("not start yet");

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

            // let WifiManager = require("../plugins/cordova-plugin-android-wifi-manager/www/index");

            // WifiManager.startScan((err, success) => {
            //     if (err) {
            //         console.log("error" + err);
            //     } else {
            //         console.log("scan success" + success);
            //     }
            // });
            //
            // WifiManager.getScanResults((err, scanResults) => {
            //     if (err) {
            //         console.log("error" + err);
            //     } else {
            //         console.log("results" + scanResults);
            //     }
            // });

            // WifiWizard2.scan({}).then(r => {
            //     console.log(r);
            //     let networks = WifiWizard2.getScanResults({});
            //     console.log(networks);
            // }).catch(e => console.log(e));


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

        // Configure zeroconf
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

    }
});

if (Meteor.isCordova) {
    Template.ConnectESP.events({
        'click #connectESP' (event, instance) {
            console.log("ESP Clicked");
            WifiWizard2.requestPermission().then(r => console.log(r))
                .catch(e => console.log(e));

            WifiWizard2.getConnectedSSID().then(r => console.log(r))
                .catch(e => console.log(e));

            WifiWizard2.getConnectedBSSID().then(r => console.log(r))
                .catch(e => console.log(e));

            WifiWizard2.getWifiIP().then(r => console.log(r))
                .catch(e => console.log(e));

            WifiWizard2.listNetworks().then(r => console.log(r))
                .catch(e => console.log(e));

            WifiWizard2.scan({}).then(function (results) {
                console.log(results);

                let networks = WifiWizard2.getScanResults({});
                console.log(networks);
            }).catch(e => console.log(e));



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
        }
    });
}


