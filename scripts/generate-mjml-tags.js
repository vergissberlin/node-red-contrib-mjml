#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const presetCore = require("mjml-preset-core");

const OUTPUT_PATH = path.join(__dirname, "..", "mjml-parse", "resources", "mjml-tags.json");
const SOURCE =
    "generated from mjml-preset-core (componentName + allowedAttributes); helper tags from vscode-mjml grammar";
const HELPER_TAGS = ["mj-all", "mj-class", "mj-include"];

function sortAlpha(items) {
    return Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
}

function buildCatalog() {
    const tagAttributes = {};
    const allAttributes = [];
    const componentTags = [];

    const components = Object.values(presetCore.components || {});
    components.forEach((component) => {
        const tag = component && component.componentName;
        if (!tag || typeof tag !== "string") {
            return;
        }

        const attributes = sortAlpha(Object.keys(component.allowedAttributes || {}));
        componentTags.push(tag);
        tagAttributes[tag] = attributes;
        allAttributes.push(...attributes);
    });

    const tags = sortAlpha(componentTags.concat(HELPER_TAGS));
    const attributes = sortAlpha(allAttributes);

    return {
        source: SOURCE,
        generatedAt: new Date().toISOString(),
        mjmlVersion: require("mjml/package.json").version,
        tags,
        attributes,
        helperTags: HELPER_TAGS,
        tagAttributes
    };
}

function writeCatalog() {
    const catalog = buildCatalog();
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(catalog, null, 2) + "\n", "utf8");
    process.stdout.write(`Updated ${OUTPUT_PATH}\n`);
}

writeCatalog();
