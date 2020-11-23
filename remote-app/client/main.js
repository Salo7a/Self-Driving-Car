import { Template } from 'meteor/templating';

import './main.html';

// WifiWizard2.scan({});
// let networks = WifiWizard2.getScanResults({});
// console.log(networks);

Template.connectESP.events({
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

