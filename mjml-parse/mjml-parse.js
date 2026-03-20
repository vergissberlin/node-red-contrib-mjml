const mjml2html = require('mjml');
const { renderMustacheTemplate } = require('./mustache-render');

module.exports = function (RED) {
    const options = {
        minify: false,
        keepComments: false,
        validationLevel: 'soft',
        ignoreIncludes: true  // Mitigate CVE-2020-12827 (mj-include path traversal)
    }

    function MjmlParseNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.template = config.template || '';

        node.on('input', async function (msg, send, done) {
            send = send || function () { node.send.apply(node, arguments); };
            done = done || function (err) { if (err) { node.error(err, msg); } };
            let msgError = RED._("mjmlParse.message.status.error");
            let templateSource = node.template;

            if (!templateSource && typeof msg.template === 'string') {
                templateSource = msg.template;
            }

            if (!templateSource) {
                templateSource = msg.payload;
            }

            // Check if the message is a string
            if (typeof templateSource !== "string") {
                node.status({fill: "red", shape: "ring", text: msgError})
                // Send the error
                done(msgError);
                return;
            }

            // Catch errors
            try {
                const resolvedTemplate = await renderMustacheTemplate(RED, node, msg, templateSource);
                const result = mjml2html(resolvedTemplate, options);
                // Check if the result is valid
                if (result.errors.length > 0) {
                    node.status({fill: "red", shape: "ring", text: "node-red:common.status.error"})
                    // Send the error
                    done(result.errors);
                } else {
                    node.status({fill: "green", shape: "ring", text: "node-red:common.status.ok"})
                    // Send the result
                    msg.payload = result.html;
                    send(msg);
                    done();
                }
            } catch (error) {
                node.status({fill: "red", shape: "ring", text: msgError})
                // Send the error
                done(error.message);
            }
        });
    }
    RED.nodes.registerType('mjml-parse', MjmlParseNode);
}
