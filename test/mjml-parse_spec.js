const helper = require("node-red-node-test-helper");
const MjmlParseNode = require("../mjml-parse/mjml-parse.js");
const fs = require("fs");
const assert = require("assert");
const path = require("path");

describe('mjml-parse Node', function () {
    let testMjmlValid;

    this.timeout(5000);

    before(function () {
        helper.init(require.resolve('node-red'));
        testMjmlValid = fs.readFileSync(__dirname + '/fixtures/template.mjml', {encoding: 'utf8', flag: 'r'});
    });

    beforeEach(function (done) {
        helper.startServer(done);
    });

    afterEach(function () {
        helper.unload();
        helper.stopServer();
    });

    it('should be loaded', function (done) {
        var flow = [{id: "n1", type: "mjml-parse", name: "test name"}];
        helper.load(MjmlParseNode, flow, function () {
            var n1 = helper.getNode("n1");
            n1.should.have.property('name', 'test name');
            done();
        });
    });

    it('should convert mjml payload to html', function (done) {
        var flow = [{id: "n1", type: "mjml-parse", name: "test name", wires: [["n2"]]},
        {id: "n2", type: "helper"}];

        helper.load(MjmlParseNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('payload');
                    msg.payload.should.containEql('<!doctype html>');
                    msg.payload.should.containEql('Hello World');
                    done();
                } catch (err) {
                    done(err);
                }
            });
            n1.receive({payload: testMjmlValid});
        });
    });

    it('should render mustache placeholders from configured template', function (done) {
        var flow = [{id: "n1", type: "mjml-parse", template: '<mjml><mj-body><mj-section><mj-column><mj-text>Hello {{payload}}</mj-text></mj-column></mj-section></mj-body></mjml>', wires: [["n2"]]},
        {id: "n2", type: "helper"}];

        helper.load(MjmlParseNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.payload.should.containEql('Hello Team');
                    done();
                } catch (err) {
                    done(err);
                }
            });
            n1.receive({payload: "Team"});
        });
    });

    it('should use msg.template when editor template is empty', function (done) {
        var flow = [{id: "n1", type: "mjml-parse", template: "", wires: [["n2"]]},
        {id: "n2", type: "helper"}];

        helper.load(MjmlParseNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.payload.should.containEql('Runtime Template');
                    done();
                } catch (err) {
                    done(err);
                }
            });
            n1.receive({
                payload: "<mjml><mj-body><mj-section><mj-column><mj-text>Unused</mj-text></mj-column></mj-section></mj-body></mjml>",
                template: "<mjml><mj-body><mj-section><mj-column><mj-text>{{topic}}</mj-text></mj-column></mj-section></mj-body></mjml>",
                topic: "Runtime Template"
            });
        });
    });

    it("should render preview endpoint with valid MJML", function (done) {
        helper.load(MjmlParseNode, [], function () {
            helper.request()
                .post("/mjml-parse/preview")
                .send({
                    template: "<mjml><mj-body><mj-section><mj-column><mj-text>Preview OK</mj-text></mj-column></mj-section></mj-body></mjml>"
                })
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    try {
                        res.body.should.have.property("ok", true);
                        res.body.should.have.property("html");
                        res.body.html.should.containEql("Preview OK");
                        done();
                    } catch (assertionError) {
                        done(assertionError);
                    }
                });
        });
    });

    it("should reject preview endpoint when template is empty", function (done) {
        helper.load(MjmlParseNode, [], function () {
            helper.request()
                .post("/mjml-parse/preview")
                .send({template: "   "})
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        done(err);
                        return;
                    }
                    try {
                        res.body.should.have.property("ok", false);
                        res.body.should.have.property("errors");
                        res.body.errors.should.be.Array();
                        done();
                    } catch (assertionError) {
                        done(assertionError);
                    }
                });
        });
    });

    it("should include German preview translations", function () {
        var deDe = JSON.parse(fs.readFileSync(__dirname + "/../mjml-parse/locales/de-DE/mjml-parse.json", "utf8"));
        var deCh = JSON.parse(fs.readFileSync(__dirname + "/../mjml-parse/locales/de-CH/mjml-parse.json", "utf8"));

        assert.strictEqual(deDe.mjmlParse.preview.label, "HTML-Vorschau");
        assert.strictEqual(deDe.mjmlParse.preview.loading, "Vorschau wird gerendert...");
        assert.strictEqual(deCh.mjmlParse.preview.label, "HTML-Vorschau");
        assert.strictEqual(deCh.mjmlParse.preview.loading, "Vorschau wird gerendert...");
    });

    it("should include preview translation keys in all locales", function () {
        var localesRoot = path.join(__dirname, "..", "mjml-parse", "locales");
        var localeFolders = fs.readdirSync(localesRoot, { withFileTypes: true })
            .filter(function (entry) { return entry.isDirectory(); })
            .map(function (entry) { return entry.name; });

        localeFolders.length.should.be.above(0);

        localeFolders.forEach(function (localeCode) {
            var localePath = path.join(localesRoot, localeCode, "mjml-parse.json");
            var content = JSON.parse(fs.readFileSync(localePath, "utf8"));
            var preview = content && content.mjmlParse && content.mjmlParse.preview;

            assert.ok(preview, "Missing preview translations in " + localeCode);
            assert.ok(typeof preview.label === "string" && preview.label.length > 0, "Missing preview.label in " + localeCode);
            assert.ok(typeof preview.empty === "string" && preview.empty.length > 0, "Missing preview.empty in " + localeCode);
            assert.ok(typeof preview.loading === "string" && preview.loading.length > 0, "Missing preview.loading in " + localeCode);
            assert.ok(typeof preview.ready === "string" && preview.ready.length > 0, "Missing preview.ready in " + localeCode);
            assert.ok(typeof preview.error === "string" && preview.error.length > 0, "Missing preview.error in " + localeCode);
        });
    });
});
