import { Template } from 'meteor/templating';

import './main.html';

// let zeroconf = cordova.plugins.zeroconf;
zeroconf.watchAddressFamily = 'ipv4';

// WifiWizard2.scan({});
// let networks = WifiWizard2.getScanResults({});
// console.log(networks);

Meteor.startup(function() {
    if (Meteor.isCordova)
    {
        // Here we can be sure the plugin has been initialized

        // Configure zeroconf
        zeroconf.watch('_http._tcp.', 'local.', function(result) {
            let action = result.action;
            let service = result.service;
            if (action == 'added')
            {
                console.log('service added', service);
            }
            else if (action == 'resolved')
            {
                console.log('service resolved', service);
                $("p").text = service;
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

Template.ConnectESP.events({
    'click #connectESP' (event, instance) {
        console.log("ESP Clicked");
        
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

