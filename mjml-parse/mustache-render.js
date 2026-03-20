/**
 * Adapted from Node-RED core template node:
 * https://github.com/node-red/node-red/blob/master/packages/node_modules/@node-red/nodes/core/function/80-template.js
 *
 * Copyright OpenJS Foundation and Node-RED contributors
 * Licensed under Apache License 2.0
 */
'use strict';

const mustache = require('mustache');

function extractTokens(tokens, set) {
    const target = set || new Set();
    tokens.forEach(function (token) {
        if (token[0] !== 'text') {
            target.add(token[1]);
            if (token.length > 4) {
                extractTokens(token[4], target);
            }
        }
    });
    return target;
}

function parseContext(key) {
    const match = /^(flow|global)(\[(\w+)\])?\.(.+)/.exec(key);
    if (!match) {
        return undefined;
    }

    return {
        type: match[1],
        store: match[3] === '' ? 'default' : match[3],
        field: match[4]
    };
}

function parseEnv(key) {
    const match = /^env\.(.+)/.exec(key);
    if (!match) {
        return undefined;
    }
    return match[1];
}

function NodeContext(msg, nodeContext, parent, cachedContextTokens) {
    this.msgContext = new mustache.Context(msg, parent);
    this.nodeContext = nodeContext;
    this.cachedContextTokens = cachedContextTokens;
}

NodeContext.prototype = new mustache.Context();

NodeContext.prototype.lookup = function lookup(name) {
    const value = this.msgContext.lookup(name);
    if (value !== undefined) {
        return value;
    }

    if (parseEnv(name)) {
        return this.cachedContextTokens[name];
    }

    const context = parseContext(name);
    if (context) {
        return this.cachedContextTokens[name];
    }

    return '';
};

NodeContext.prototype.push = function push(view) {
    return new NodeContext(view, this.nodeContext, this.msgContext, this.cachedContextTokens);
};

async function renderMustacheTemplate(RED, node, msg, template) {
    const promises = [];
    const tokens = extractTokens(mustache.parse(template));
    const resolvedTokens = {};

    tokens.forEach(function (name) {
        const envName = parseEnv(name);
        if (envName) {
            resolvedTokens[name] = RED.util.evaluateNodeProperty(envName, 'env', node, msg);
            return;
        }

        const context = parseContext(name);
        if (!context) {
            return;
        }

        const target = node.context()[context.type];
        if (!target) {
            return;
        }

        promises.push(new Promise((resolve, reject) => {
            target.get(context.field, context.store, (err, value) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolvedTokens[name] = value;
                resolve();
            });
        }));
    });

    await Promise.all(promises);
    return mustache.render(template, new NodeContext(msg, node.context(), null, resolvedTokens));
}

module.exports = {
    renderMustacheTemplate
};
