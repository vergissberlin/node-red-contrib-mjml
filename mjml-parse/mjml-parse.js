const mjml2html = require('mjml');

module.exports = function (RED) {
    const options = {
        minify: false,
        keepComments: false,
        validationLevel: 'soft'
    }

    function MjmlParseNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function (msg) {
            let msgError = RED._("mjmlParse.message.status.error");
            // Check if the message is a string
            if (typeof msg.payload !== "string") {
                node.status({fill: "red", shape: "ring", text: msgError})
                // Send the error
                node.error(msgError);
            }

            // Catch errors
            try {
                const result = mjml2html(msg.payload, options);
                // Check if the result is valid
                if (result.errors.length > 0) {
                    node.status({fill: "red", shape: "ring", text: "node-red:common.status.error"})
                    // Send the error
                    node.error(result.errors);
                } else {
                    node.status({fill: "green", shape: "ring", text: "node-red:common.status.ok"})
                    // Send the result
                    msg.payload = result.html;
                    node.send(msg);
                }
            } catch (error) {
                node.status({fill: "red", shape: "ring", text: msgError})
                // Send the error
                node.error(error.message);
            }
        });
    }
    RED.nodes.registerType('mjml-parse', MjmlParseNode);
}
