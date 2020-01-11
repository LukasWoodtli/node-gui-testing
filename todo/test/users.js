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
            var options = {
                headers: {
                    'x-test': 'Test 123',
                    'x-test-2': 'Test 234'
                },
                debug: true,
                maxWait: '1ms'
            };
            var browser = new Browser();
            browser.visit("http://localhost:3000/users/new", options, function (err) {
                if (err) throw err;
                console.log('VISIT IS DONE');
                assert.ok(browser.success, "page loaded");

                assert.equal(browser.text('h1'), 'New User');
                var form = browser.query('form');
                assert(form, 'form exists');
                assert.equal(form.method, 'post', 'uses POST method');
                assert.equal(form.action, 'http://localhost:3000/users', 'posts to /users');

                /* Complex selectors: tag name selector (form), ID selector #id and attribute selector [type=email].
                ** i.e: the selector `input[type=email]#email` selects inputs that have:
                ** - *attribute* of type *email* and
                ** - an *ID* of the value *email*
                **/
                assert(browser.query('input[type=email]#email', form), 'has email input');
                assert(browser.query('input[type=password]#password', form), 'has password input');

                assert(browser.query('input[type=submit]', form), 'has submit button');

                done();
            });
        });
    });
});

