var assert = require('assert'),
    Browser = require('zombie'),
    app = require('../app'),
    couchdb = require('../lib/couchdb'),
    dbName = 'users',
    db = couchdb.use(dbName),
    fixtures = require('./fixtures');

describe('Session', function () {
    before(function (done) {
        app.start(3000, done);
    });
    after(function (done) {
        app.server.close(done);
    });

    describe('Log in form', function () {
        before(function (done) {
            db.get(fixtures.user.email, function (err, doc) {
                console.log('Before:');
                console.log(err);
                if (err && (err.status_code === 404 || err.statusCode === 404)) {
                    return db.insert(fixtures.user, fixtures.user.email, done);
                }
                if (err) throw err;
                done();
            });
        });
        it('should load', function (done) {
            Browser.visit('http://localhost:3000/session/new', function (err, browser) {
                if (err) throw err;
                assert.ok(browser.success, 'page loaded');
                assert.equal(browser.text('h1'), 'Log in');

                var form = browser.query('form');

                assert(form, 'form exists');
                assert.equal(form.method, 'post', 'uses POST method');
                assert.equal(form.action, 'http://localhost:3000/session', 'posts to /session');

                assert(browser.query('input[type=email]#email', form), 'has email input');
                assert(browser.query('input[type=password]#password', form), 'has password input');
                assert(browser.query('input[type=submit]', form), 'has submit button');

                done();
            });
        });

        it('should allow you to log in', function (done) {
            Browser.visit('http://localhost:3000/session/new', function (err, browser) {
                console.log(err);
                if (err) throw err;

                browser.fill('E-mail', fixtures.user.email);
                browser.fill('Password', fixtures.user.password);
                browser.pressButton('Log In', function (err) {
                    console.log("Press Button:");
                    console.log(err);
                    if (err) throw err;
                    assert.equal(browser.location.pathname, '/todos', 'should be redirected to /todos');
                    done();
                });
            });
        });
    });
});
