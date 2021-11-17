module.exports = function (RED) {
    import mjml2html from 'mjml'

    const options = {
        beautify: true,
        minify: false,
        validationLevel: 'strict'
    }

    function MJMLNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function (msg) {
            msg.payload = mjml2html(msg.payload, options)
            node.send(msg);
        });
    }
    RED.nodes.registerType("mjml", MJMLNode);
}
