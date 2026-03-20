"use strict";

const assert = require("assert");
const express = require("express");
const request = require("supertest");
const mjmlParseModule = require("../mjml-parse/mjml-parse.js");

/**
 * Minimal RED stub so the node module can register its admin route and node type.
 */
function createMockRed(authOptions) {
    const app = express();
    app.use(express.json({ limit: "5mb" }));
    const RED = {
        httpAdmin: app,
        nodes: {
            registerType: function () {
                // Node constructor is not exercised in these tests.
            }
        },
        _: function (key) {
            return key;
        }
    };
    if (authOptions && authOptions.auth) {
        RED.auth = authOptions.auth;
    }
    mjmlParseModule(RED);
    return app;
}

describe("mjml-parse admin preview (auth middleware)", function () {
    it("returns 403 when RED.auth.needsPermission denies the request", function (done) {
        const app = createMockRed({
            auth: {
                needsPermission: function () {
                    return function deny(req, res) {
                        res.status(403).json({ ok: false, reason: "forbidden" });
                    };
                }
            }
        });
        request(app)
            .post("/mjml-parse/preview")
            .send({
                template: "<mjml><mj-body><mj-section><mj-column><mj-text>x</mj-text></mj-column></mj-section></mj-body></mjml>"
            })
            .expect(403)
            .end(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                try {
                    assert.strictEqual(res.body.ok, false);
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it("allows preview when RED.auth is absent (no-auth / test harness)", function (done) {
        const app = createMockRed({});
        request(app)
            .post("/mjml-parse/preview")
            .send({
                template: "<mjml><mj-body><mj-section><mj-column><mj-text>ok</mj-text></mj-column></mj-section></mj-body></mjml>"
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                try {
                    assert.strictEqual(res.body.ok, true);
                    assert.ok(typeof res.body.html === "string");
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });

    it("allows preview when needsPermission calls next()", function (done) {
        const app = createMockRed({
            auth: {
                needsPermission: function () {
                    return function allow(req, res, next) {
                        next();
                    };
                }
            }
        });
        request(app)
            .post("/mjml-parse/preview")
            .send({
                template: "<mjml><mj-body><mj-section><mj-column><mj-text>ok</mj-text></mj-column></mj-section></mj-body></mjml>"
            })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err);
                    return;
                }
                try {
                    assert.strictEqual(res.body.ok, true);
                    done();
                } catch (e) {
                    done(e);
                }
            });
    });
});
