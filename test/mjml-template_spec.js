const helper = require("node-red-node-test-helper");
const MjmlParseNode = require("../mjml-template/mjml-template.js");
const fs = require("fs");
const path = require("path");

describe('mjml-template Node', function () {
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
        var flow = [{id: "n1", type: "mjml-template", name: "test name"}];
        helper.load(MjmlParseNode, flow, function () {
            var n1 = helper.getNode("n1");
            n1.should.have.property('name', 'test name');
            done();
        });
    });

    it('should syntax highlight MJML syntax in the content tab', function (done) {
        this.skip();
    });

    it('should convert MJML body content to HTML for the output', function (done) {
        this.skip();
        var flow = [{id: "n1", type: "mjml-template", name: "test name", wires: [["n2"]]},
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

    it('should render a preview in the second tab', function (done) {
        this.skip();
    });

    it('should parse {{msg.payload}} the get dynamic content', function (done) {
        this.skip();
    });

    it('should render a message on syntax errors', function (done) {
        this.skip();
    });

    it('should set status on node for MJML to HTML process.', function (done) {
        this.skip();
    });

});
