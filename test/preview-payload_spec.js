const assert = require("assert");
const {
    buildPreviewPayload,
    normalizeValidationError,
    normalizePlainError
} = require("../mjml-parse/preview-payload");

describe("preview-payload (MJML preview API normalization)", function () {
    describe("buildPreviewPayload", function () {
        it("should return ok true and empty error arrays when mjml reports no errors", function () {
            var payload = buildPreviewPayload({
                html: "<!doctype html><html></html>",
                errors: []
            });
            assert.strictEqual(payload.ok, true);
            assert.strictEqual(payload.html, "<!doctype html><html></html>");
            assert.deepStrictEqual(payload.errors, []);
            assert.deepStrictEqual(payload.validationErrors, []);
        });

        it("should coerce missing html to empty string", function () {
            var payload = buildPreviewPayload({ errors: [] });
            assert.strictEqual(payload.html, "");
            assert.strictEqual(payload.ok, true);
        });

        it("should treat missing errors array as no errors", function () {
            var payload = buildPreviewPayload({ html: "x" });
            assert.strictEqual(payload.ok, true);
            assert.deepStrictEqual(payload.validationErrors, []);
        });

        it("should return ok false when mjml reports errors", function () {
            var payload = buildPreviewPayload({
                html: "",
                errors: ["Something went wrong"]
            });
            assert.strictEqual(payload.ok, false);
            assert.deepStrictEqual(payload.errors, ["Something went wrong"]);
            assert.deepStrictEqual(payload.validationErrors, [{ message: "Something went wrong" }]);
        });

        it("should map structured MJML errors for editor diagnostics (line / tag / formatted message)", function () {
            var payload = buildPreviewPayload({
                html: "<partial/>",
                errors: [{
                    message: "Unknown element",
                    formattedMessage: "Line 8 — unknown tag",
                    line: 7,
                    tagNameLine: 12,
                    tagName: "mj-sectionj"
                }]
            });
            assert.strictEqual(payload.ok, false);
            assert.strictEqual(payload.errors[0], "Line 8 — unknown tag");
            assert.deepStrictEqual(payload.validationErrors[0], {
                message: "Unknown element",
                line: 7,
                column: 12,
                tagName: "mj-sectionj",
                formattedMessage: "Line 8 — unknown tag"
            });
        });

        it("should omit column when tagNameLine is not a number", function () {
            var payload = buildPreviewPayload({
                html: "",
                errors: [{ message: "x", line: 1, tagName: "mj-foo" }]
            });
            assert.strictEqual(payload.validationErrors[0].line, 1);
            assert.strictEqual(payload.validationErrors[0].column, undefined);
        });

        it("should stringify object errors without message or formattedMessage", function () {
            var payload = buildPreviewPayload({
                html: "",
                errors: [{ weird: true }]
            });
            assert.strictEqual(payload.validationErrors[0].message, '{"weird":true}');
            assert.strictEqual(payload.errors[0], '{"weird":true}');
        });

        it("should survive null result like a safe default", function () {
            var payload = buildPreviewPayload(null);
            assert.strictEqual(payload.ok, true);
            assert.strictEqual(payload.html, "");
            assert.deepStrictEqual(payload.errors, []);
        });
    });

    describe("normalizeValidationError", function () {
        it("should wrap string errors", function () {
            assert.deepStrictEqual(normalizeValidationError("a"), { message: "a" });
        });
    });

    describe("normalizePlainError", function () {
        it("should pass through string errors", function () {
            assert.strictEqual(normalizePlainError("a"), "a");
        });

        it("should prefer formattedMessage for plain error list", function () {
            assert.strictEqual(
                normalizePlainError({ formattedMessage: "fmt", message: "msg" }),
                "fmt"
            );
        });
    });
});
