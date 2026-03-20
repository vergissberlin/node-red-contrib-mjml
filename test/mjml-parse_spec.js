const helper = require("node-red-node-test-helper");
const MjmlParseNode = require("../mjml-parse/mjml-parse.js");
const fs = require("fs");

describe('mjml-parse Node', function () {
    let testMjmlValid;

    this.timeout(5000);

    before(function () {
        helper.init(require.resolve('node-red'));
        testMjmlValid = fs.readFileSync(__dirname + '/fixtures/template.mjml', {encoding: 'utf8', flag: 'r'});
    });

    afterEach(function () {
        helper.unload();
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
});
