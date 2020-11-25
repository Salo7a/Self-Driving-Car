// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by remote-app.js.
import { name as packageName } from "meteor/fla7a:remote-app";

// Write your tests here!
// Here is an example.
Tinytest.add('remote-app - example', function (test) {
  test.equal(packageName, "remote-app");
});
