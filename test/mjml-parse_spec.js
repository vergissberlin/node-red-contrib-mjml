const helper = require("node-red-node-test-helper");
const MjmlParseNode = require("../mjml-parse/mjml-parse.js");
const fs = require("fs");
const path = require("path");

describe('mjml-parse Node', function () {
    let testMjml, testHtml;

    before(async function () {
        // Load html file from disk
        testMjmlValid = await fs.readFileSync(__dirname + '/fixtures/template.mjml', {encoding: 'utf8', flag: 'r'});
        testHtmlValid = await fs.readFileSync(__dirname + '/fixtures/template.html', {encoding: 'utf8', flag: 'r'});
        testMjmlInvalid = 'dirk'
        testHtml = 'dirk'
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
        this.skip()
        var flow = [{id: "n1", type: "mjml-parse", name: "test name", wires: [["n2"]]},
        {id: "n2", type: "helper"}];

        helper.load(MjmlParseNode, flow, function () {
            var n2 = helper.getNode("n2");
            var n1 = helper.getNode("n1");

            n2.on("input", function (msg) {
                try {
                    msg.should.have.property('payload', testHtmlValid);
                    done();
                } catch (err) {
                    done(err);
                }
            });
            n1.receive({payload: testMjmlValid});
        });
    });
});
