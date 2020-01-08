// useful for analysis of hanged modules:
// var wtf = require('wtfnode');
// see use of `wtf.dump()` in `after` function

var assert = require("assert");
var Browser = require("zombie");
var app = require("../app");

before(function (done) {
    app.start(3000, done);
});

after(function (done) {
    app.server.close(done);
    // see top of file:
    // wtf.dump();
});

describe("Users", function () {
    describe("Signup Form", function () {
        it("should load the signup form", function (done) {
            var browser = new Browser();
            browser.visit("http://localhost:3000/users/new", function (err, browser) {
                if (err) throw err;
                assert.ok(browser.success, "page loaded");
                done();
            });
        });
    });
});

