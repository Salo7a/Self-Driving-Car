//////////////////////////////////////////////////////////////////////////
//                                                                      //
// This is a generated file. You can view the original                  //
// source in your browser if your browser supports source maps.         //
// Source maps are supported by all recent versions of Chrome, Safari,  //
// and Firefox, and by Internet Explorer 11.                            //
//                                                                      //
//////////////////////////////////////////////////////////////////////////


(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var MeteorCamera = Package['mdg:camera'].MeteorCamera;

/* Package-scope variables */
var MeteorCameraUI;

(function(){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                  //
// packages/okland_camera-ui/packages/okland_camera-ui.js                                                           //
//                                                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                    //
(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/okland:camera-ui/camera-ui.js                                                                    //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
MeteorCameraUI = {};                                                                                         // 1
                                                                                                             // 2
                                                                                                             // 3
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/okland:camera-ui/camera-ui-client.js                                                             //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
/**                                                                                                          // 1
 * Helper function for uploading base 64 image to server.                                                    // 2
 * @summary Take JPEG image dataURI and return blob of the given content type                                // 3
 * @returns {Blob}                                                                                           // 4
 */                                                                                                          // 5
MeteorCameraUI.dataURIToBlob = function (dataURI) {                                                          // 6
  // Check that input exists                                                                                 // 7
  if (!dataURI) {                                                                                            // 8
    return;                                                                                                  // 9
  }                                                                                                          // 10
  //                                                                                                         // 11
  var splitedDataURI = dataURI.split(',');                                                                   // 12
  // Split the image base64 from dataURI                                                                     // 13
  if (!splitedDataURI || splitedDataURI.length < 2) {                                                        // 14
    return;                                                                                                  // 15
  }                                                                                                          // 16
  var base64 = splitedDataURI[1];                                                                            // 17
  return MeteorCameraUI.b64toBlob(base64, 'image/jpeg');                                                     // 18
};                                                                                                           // 19
                                                                                                             // 20
                                                                                                             // 21
/**                                                                                                          // 22
 * Helper function for uploading base 64 image to server.                                                    // 23
 * @summary Take base 64 data and return blob of the given content type                                      // 24
 * @param b64Data                                                                                            // 25
 * @param contentType                                                                                        // 26
 * @param sliceSize                                                                                          // 27
 * @returns {Blob}                                                                                           // 28
 */                                                                                                          // 29
MeteorCameraUI.b64toBlob = function (b64Data, contentType, sliceSize) {                                      // 30
  contentType = contentType || '';                                                                           // 31
  sliceSize = sliceSize || 512;                                                                              // 32
                                                                                                             // 33
  var byteCharacters = atob(b64Data);                                                                        // 34
  var byteArrays = [];                                                                                       // 35
                                                                                                             // 36
  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {                                // 37
    var slice = byteCharacters.slice(offset, offset + sliceSize);                                            // 38
                                                                                                             // 39
    var byteNumbers = new Array(slice.length);                                                               // 40
    for (var i = 0; i < slice.length; i++) {                                                                 // 41
      byteNumbers[i] = slice.charCodeAt(i);                                                                  // 42
    }                                                                                                        // 43
                                                                                                             // 44
    var byteArray = new Uint8Array(byteNumbers);                                                             // 45
                                                                                                             // 46
    byteArrays.push(byteArray);                                                                              // 47
  }                                                                                                          // 48
                                                                                                             // 49
  var blob;                                                                                                  // 50
  try {                                                                                                      // 51
    blob = new Blob(byteArrays, {type: contentType});                                                        // 52
  }                                                                                                          // 53
  catch (e) {                                                                                                // 54
    // TypeError old chrome and FF                                                                           // 55
    window.BlobBuilder = window.BlobBuilder ||                                                               // 56
      window.WebKitBlobBuilder ||                                                                            // 57
      window.MozBlobBuilder ||                                                                               // 58
      window.MSBlobBuilder;                                                                                  // 59
    if (e.name == 'TypeError' && window.BlobBuilder) {                                                       // 60
      var bb = new BlobBuilder();                                                                            // 61
      bb.append(byteArrays);                                                                                 // 62
      blob = bb.getBlob(contentType);                                                                        // 63
    }                                                                                                        // 64
    else if (e.name == "InvalidStateError") {                                                                // 65
      // InvalidStateError (tested on FF13 WinXP)                                                            // 66
      blob = new Blob(byteArrays, {type: contentType});                                                      // 67
    }                                                                                                        // 68
    else {                                                                                                   // 69
      // We're screwed, blob constructor unsupported entirely                                                // 70
      console.error('b64toBlob: blob constructor unsupported entirely');                                     // 71
    }                                                                                                        // 72
  }                                                                                                          // 73
  return blob;                                                                                               // 74
};                                                                                                           // 75
                                                                                                             // 76
/**                                                                                                          // 77
 * @summary Just use regular MeteorCamera.getPicture method                                                  // 78
 * @param {Object}   options  Options - Optional                                                             // 79
 * @param {Number} options.height The minimum height of the image                                            // 80
 * @param {Number} options.width The minimum width of the image                                              // 81
 * @param {Number} options.quality [description]                                                             // 82
 * @type {Function}                                                                                          // 83
 */                                                                                                          // 84
MeteorCameraUI.getPictureNoUI = MeteorCamera.getPicture;                                                     // 85
                                                                                                             // 86
                                                                                                             // 87
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                           //
// packages/okland:camera-ui/camera-ui-cordova.js                                                            //
//                                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                             //
/******************** Private functions ****************************/                                        // 1
                                                                                                             // 2
var devicePlatform = window && window.device && window.device.platform;                                      // 3
                                                                                                             // 4
var isAndroidDevice = function () {                                                                          // 5
  return devicePlatform == 'Android';                                                                        // 6
};                                                                                                           // 7
                                                                                                             // 8
var isIosDevice = function () {                                                                              // 9
  return devicePlatform == 'iOS';                                                                            // 10
};                                                                                                           // 11
                                                                                                             // 12
/**                                                                                                          // 13
 * Check whether ios or android device and give the specific options for it.                                 // 14
 * @param {Object} options  Options - Optional                                                               // 15
 * @param {Object} options.iosOptions {special options only for ios}                                         // 16
 * @param {Object} options.androidOptions {special options only for android}                                 // 17
 * @returns {{}}                                                                                             // 18
 */                                                                                                          // 19
var getOptionsPerDevice = function (options) {                                                               // 20
  options = options || {};                                                                                   // 21
  if (isAndroidDevice() && options.androidOptions) {                                                         // 22
    options = _.extend({}, options.androidOptions, options);                                                 // 23
  } else if (isIosDevice() && options.iosOptions) {                                                          // 24
    options = _.extend({}, options.iosOptions, options);                                                     // 25
  }                                                                                                          // 26
  return options;                                                                                            // 27
};                                                                                                           // 28
                                                                                                             // 29
/**                                                                                                          // 30
 * @summary Create action sheet options setting for taking image                                             // 31
 * @param {Object} options  Options - Optional                                                               // 32
 * @param {String} options.takeImage - Text of take image button                                             // 33
 * @param {String} options.imageLibrary - Text of image library button                                       // 34
 * @param {String} options.cancel - Text of cancel button                                                    // 35
 * @returns {{buttonLabels: Array, androidEnableCancelButton: boolean, winphoneEnableCancelButton: boolean, addCancelButtonWithLabel: *}}
 */                                                                                                          // 37
var getActionsSheetOptions = function (options) {                                                            // 38
  options = options || {};                                                                                   // 39
                                                                                                             // 40
  var buttonTexts = {                                                                                        // 41
    takeImage: options.takeImage || 'Take Image',                                                            // 42
    imageLibrary: options.imageLibrary || 'Image Library',                                                   // 43
    cancel: options.cancel || 'Cancel'                                                                       // 44
  };                                                                                                         // 45
  return {                                                                                                   // 46
    'buttonLabels': [                                                                                        // 47
      buttonTexts.takeImage,                                                                                 // 48
      buttonTexts.imageLibrary                                                                               // 49
    ],                                                                                                       // 50
    'androidEnableCancelButton': true, // default false                                                      // 51
    'winphoneEnableCancelButton': true, // default false                                                     // 52
    'addCancelButtonWithLabel': buttonTexts.cancel                                                           // 53
  };                                                                                                         // 54
};                                                                                                           // 55
                                                                                                             // 56
var takePicture = function (options, usingPhotoLibrary, callback) {                                          // 57
  var pictureOptions = getOptionsPerDevice(options);                                                         // 58
  if (usingPhotoLibrary) {                                                                                   // 59
    pictureOptions.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;                                       // 60
  }                                                                                                          // 61
  MeteorCamera.getPicture(pictureOptions, callback);                                                         // 62
};                                                                                                           // 63
                                                                                                             // 64
/******************** Public functions *****************************/                                        // 65
                                                                                                             // 66
/**                                                                                                          // 67
 * @summary Get a picture from the device's default camera.                                                  // 68
 *          Show ActionSheet to ask whether to take the image from camera or imageLibrary.                   // 69
 *          Same as MeteorCamera.getPicture just allow to give                                               // 70
 *          special options using options.androidOptions or options.iosOptions.                              // 71
 * @param {Object}   options  Options - Optional                                                             // 72
 * @param {Number} options.height The minimum height of the image                                            // 73
 * @param {Number} options.width The minimum width of the image                                              // 74
 * @param {Number} options.quality [description]                                                             // 75
 * @param {Object} options.buttonTexts {cancel:String, takeImage:String, imageLibrary:String}                // 76
 * @param {Object} options.iosOptions {special options only for ios}                                         // 77
 * @param {Object} options.androidOptions {special options only for android}                                 // 78
 * @param  {Function} callback A callback that is called with two arguments:                                 // 79
 * 1. error, an object that contains error.message and possibly other properties                             // 80
 * depending on platform                                                                                     // 81
 * 2. data, a Data URI string with the image encoded in JPEG format, ready to                                // 82
 * use as the `src` attribute on an `<img />` tag.                                                           // 83
 */                                                                                                          // 84
MeteorCameraUI.getPicture = function (options, callback) {                                                   // 85
  // Checks whether device support actionsheet plugin                                                        // 86
  if (window && window.plugins && window.plugins.actionsheet) {                                              // 87
    var actionSheetOptions = getActionsSheetOptions(options);                                                // 88
    window.plugins.actionsheet.show(actionSheetOptions, function (buttonIndex) {                             // 89
      setTimeout(function () {                                                                               // 90
        var usingPhotoLibrary = false;                                                                       // 91
        // Like other Cordova plugins (prompt, confirm) the buttonIndex is 1-based (first button is index 1) // 92
        if (buttonIndex) {                                                                                   // 93
          // Image library button clicked                                                                    // 94
          if (buttonIndex === 2) {                                                                           // 95
            usingPhotoLibrary = true;                                                                        // 96
          } else if (buttonIndex === 3) {                                                                    // 97
            // Cancel button clicked                                                                         // 98
            callback();                                                                                      // 99
            return;                                                                                          // 100
          }                                                                                                  // 101
        }                                                                                                    // 102
        takePicture(options, usingPhotoLibrary, callback);                                                   // 103
      }, 1);                                                                                                 // 104
    });                                                                                                      // 105
  } else {                                                                                                   // 106
    // Use default Meteor Camera                                                                             // 107
    MeteorCamera.getPicture(options, callback);                                                              // 108
  }                                                                                                          // 109
};                                                                                                           // 110
                                                                                                             // 111
                                                                                                             // 112
                                                                                                             // 113
                                                                                                             // 114
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("okland:camera-ui", {
  MeteorCameraUI: MeteorCameraUI
});

})();
