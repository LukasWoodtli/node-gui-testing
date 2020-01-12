// useful for analysis of hanged modules:
// var wtf = require('wtfnode');
// see use of `wtf.dump()` in `after` function

var assert = require("assert");
var Browser = require("zombie");
var app = require("../app");
var fixtures = require("./fixtures");
var couchdb = require('../lib/couchdb'),
    dbName = 'users',
    db = couchdb.use(dbName);


describe("Users", function () {
    before(function (done) {
        app.start(3000, done);
    });
    
    after(function (done) {
        app.server.close(done);
        // see top of file:
        // wtf.dump();
    });

    describe("Signup Form", function () {

        before(function(done) {
            db.get(fixtures.user.email, function(err, doc) {
                if (err && err.status_code === 404) return done();
                if (err) throw err;
                db.destroy(doc._id, doc._rev, done);
            });
        });

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

        it("should submit", function (done) {
            Browser.visit("http://localhost:3000/users/new", function (err, browser) {
                if (err) throw err;

                /* It would be possible to use `browser.fill('#email', 'me@email.com')` and 
                ** `browser.fill('#password', 'mypassword')`.
                ** But the labels for each text field are using a `for` attribute that
                ** indicates the `id` attribute of the tag it belongs to.
                */
                browser.fill('E-mail', fixtures.user.email);
                browser.fill('Password', fixtures.user.password);


                browser.pressButton('Submit', function (err) {
                    if (err) throw err;
                    assert.equal(browser.location.pathname, '/users');
                    assert.equal(browser.text('h1'), 'Thank you!');
                    assert(browser.query('a[href="/session/new"]'), 'has login link');
                    done();
                });
            }); 
        });
    })
});


