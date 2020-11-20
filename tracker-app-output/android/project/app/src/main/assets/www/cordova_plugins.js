cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "cordova-plugin-meteor-webapp.WebAppLocalServer",
      "file": "plugins/cordova-plugin-meteor-webapp/www/webapp_local_server.js",
      "pluginId": "cordova-plugin-meteor-webapp",
      "merges": [
        "WebAppLocalServer"
      ]
    },
    {
      "id": "cordova-plugin-statusbar.statusbar",
      "file": "plugins/cordova-plugin-statusbar/www/statusbar.js",
      "pluginId": "cordova-plugin-statusbar",
      "clobbers": [
        "window.StatusBar"
      ]
    },
    {
      "id": "cordova-plugin-splashscreen.SplashScreen",
      "file": "plugins/cordova-plugin-splashscreen/www/splashscreen.js",
      "pluginId": "cordova-plugin-splashscreen",
      "clobbers": [
        "navigator.splashscreen"
      ]
    },
    {
      "id": "nl.x-services.plugins.actionsheet.ActionSheet",
      "file": "plugins/nl.x-services.plugins.actionsheet/www/ActionSheet.js",
      "pluginId": "nl.x-services.plugins.actionsheet",
      "clobbers": [
        "window.plugins.actionsheet"
      ]
    },
    {
      "id": "cordova-plugin-device.device",
      "file": "plugins/cordova-plugin-device/www/device.js",
      "pluginId": "cordova-plugin-device",
      "clobbers": [
        "device"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-whitelist": "1.3.4",
    "cordova-plugin-wkwebview-engine": "1.2.1",
    "cordova-plugin-meteor-webapp": "1.6.5",
    "cordova-plugin-statusbar": "2.4.3",
    "cordova-plugin-splashscreen": "5.0.3",
    "nl.x-services.plugins.actionsheet": "1.1.7",
    "cordova-plugin-device": "1.1.6"
  };
});