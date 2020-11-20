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
var Template = Package['templating-runtime'].Template;
var Session = Package.session.Session;
var Blaze = Package.blaze.Blaze;
var UI = Package.blaze.UI;
var Handlebars = Package.blaze.Handlebars;
var ReactiveVar = Package['reactive-var'].ReactiveVar;
var HTML = Package.htmljs.HTML;
var Spacebars = Package.spacebars.Spacebars;

/* Package-scope variables */
var MeteorCamera;

(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mdg_camera/template.photo.js                                                                               //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //

Template.__checkName("camera");
Template["camera"] = new Template("Template.camera", (function() {
  var view = this;
  return [ HTML.Raw('<div class="camera-overlay">\n    \n  </div>\n\n  '), HTML.DIV({
    class: function() {
      return [ "camera-popup ", Blaze.If(function() {
        return Spacebars.call(view.lookup("permissionDeniedError"));
      }, function() {
        return "camera-popup-wide";
      }) ];
    }
  }, "\n    ", Blaze.If(function() {
    return Spacebars.call(view.lookup("error"));
  }, function() {
    return [ "\n      ", Blaze.If(function() {
      return Spacebars.call(view.lookup("permissionDeniedError"));
    }, function() {
      return [ "\n        ", Spacebars.include(view.lookupTemplate("permissionDenied")), "\n      " ];
    }, function() {
      return [ "\n        ", Blaze.If(function() {
        return Spacebars.call(view.lookup("browserNotSupportedError"));
      }, function() {
        return [ "\n          ", Blaze._TemplateWith(function() {
          return {
            message: Spacebars.call("errorBrowserNotSupported")
          };
        }, function() {
          return Spacebars.include(view.lookupTemplate("genericError"));
        }), "\n        " ];
      }, function() {
        return [ "\n          ", Blaze._TemplateWith(function() {
          return {
            message: Spacebars.call("errorAccesingCamera")
          };
        }, function() {
          return Spacebars.include(view.lookupTemplate("genericError"));
        }), "\n        " ];
      }), "\n      " ];
    }), "\n    " ];
  }, function() {
    return [ "\n      ", Blaze.If(function() {
      return Spacebars.call(view.lookup("photo"));
    }, function() {
      return [ "\n        ", HTML.DIV({
        class: "center"
      }, "\n          ", HTML.IMG({
        src: function() {
          return Spacebars.mustache(view.lookup("photo"));
        },
        class: "photo-preview"
      }), "\n          ", HTML.DIV("\n            ", HTML.BUTTON({
        class: "button use-photo"
      }, Blaze.View("lookup:translate", function() {
        return Spacebars.mustache(view.lookup("translate"), "usePhoto");
      })), "\n            ", HTML.BUTTON({
        class: "button new-photo"
      }, Blaze.View("lookup:translate", function() {
        return Spacebars.mustache(view.lookup("translate"), "takeNewPhoto");
      })), "\n          "), "\n        "), "\n      " ];
    }, function() {
      return [ "\n        ", Spacebars.include(view.lookupTemplate("viewfinder")), "\n      " ];
    }), "\n    " ];
  }), "\n  ") ];
}));

Template.__checkName("viewfinder");
Template["viewfinder"] = new Template("Template.viewfinder", (function() {
  var view = this;
  return [ HTML.DIV({
    class: "viewfinder"
  }, "\n    ", HTML.VIDEO({
    id: "video",
    class: function() {
      return Blaze.If(function() {
        return Spacebars.call(view.lookup("waitingForPermission"));
      }, function() {
        return "hidden";
      });
    }
  }, "\n      "), "\n\n    ", HTML.DIV("\n      ", Blaze.If(function() {
    return Spacebars.call(view.lookup("waitingForPermission"));
  }, function() {
    return [ "\n        ", HTML.P(Blaze.View("lookup:translate", function() {
      return Spacebars.mustache(view.lookup("translate"), "waitingPermissions");
    })), "\n      " ];
  }, function() {
    return [ "\n        ", HTML.BUTTON({
      class: "button shutter"
    }, Blaze.View("lookup:translate", function() {
      return Spacebars.mustache(view.lookup("translate"), "takePhoto");
    })), "\n      " ];
  }), "\n      ", HTML.BUTTON({
    class: "button cancel"
  }, Blaze.View("lookup:translate", function() {
    return Spacebars.mustache(view.lookup("translate"), "cancel");
  })), "\n    "), "\n  "), HTML.Raw('\n\n  <canvas id="canvas" style="visibility: hidden"></canvas>') ];
}));

Template.__checkName("genericError");
Template["genericError"] = new Template("Template.genericError", (function() {
  var view = this;
  return HTML.DIV({
    class: "generic-error"
  }, "\n    ", HTML.P(Blaze.View("lookup:translate", function() {
    return Spacebars.mustache(view.lookup("translate"), view.lookup("message"));
  })), "\n    ", HTML.BUTTON({
    class: "button cancel"
  }, Blaze.View("lookup:translate", function() {
    return Spacebars.mustache(view.lookup("translate"), "closePopup");
  })), "\n  ");
}));

Template.__checkName("permissionDenied");
Template["permissionDenied"] = new Template("Template.permissionDenied", (function() {
  var view = this;
  return HTML.DIV({
    class: "permission-denied-error"
  }, "\n    ", HTML.H2(Blaze.View("lookup:translate", function() {
    return Spacebars.mustache(view.lookup("translate"), "permissionsDenied");
  })), "\n\n    ", HTML.P("\n      ", Blaze.View("lookup:translate", function() {
    return Spacebars.mustache(view.lookup("translate"), "permissionsDeniedExp");
  }), "\n    "), "\n\n    ", HTML.DL({
    class: "permissions-howto"
  }, "\n      ", HTML.Raw("<dt>Google Chrome</dt>"), "\n        ", HTML.DD(Blaze.View("lookup:translate", function() {
    return Spacebars.mustache(view.lookup("translate"), "howToChrome");
  })), "\n      ", HTML.Raw("<dt>Mozilla Firefox</dt>"), "\n        ", HTML.DD(Blaze.View("lookup:translate", function() {
    return Spacebars.mustache(view.lookup("translate"), "howToFirefox");
  })), "\n      ", HTML.Raw("<dt>Opera</dt>"), "\n        ", HTML.DD(Blaze.View("lookup:translate", function() {
    return Spacebars.mustache(view.lookup("translate"), "howToOpera");
  })), "\n    "), "\n\n    ", HTML.BUTTON({
    class: "button cancel"
  }, Blaze.View("lookup:translate", function() {
    return Spacebars.mustache(view.lookup("translate"), "closePopup");
  })), "\n  ");
}));

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mdg_camera/photo.js                                                                                        //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
MeteorCamera = {};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function(){

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                                     //
// packages/mdg_camera/photo-cordova.js                                                                                //
//                                                                                                                     //
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                                       //
MeteorCamera.getPicture = function (options, callback) {
  // if options are not passed
  if (! callback) {
    callback = options;
    options = {};
  }

  var success = function (data) {
    callback(null, "data:image/jpeg;base64," + data);
  };

  var failure = function (error) {
    callback(new Meteor.Error("cordovaError", error));
  };

  navigator.camera.getPicture(success, failure, 
    _.extend(options, {
      quality: options.quality || 49,
      targetWidth: options.width || 640,
      targetHeight: options.height || 480,
      destinationType: Camera.DestinationType.DATA_URL
    })
  );
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);


/* Exports */
Package._define("mdg:camera", {
  MeteorCamera: MeteorCamera
});

})();
