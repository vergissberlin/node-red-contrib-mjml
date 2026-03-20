'use strict';

/**
 * Normalizes MJML compiler output for the admin preview HTTP API (editor diagnostics).
 * @param {object} result - Return value of mjml()
 * @returns {{ ok: boolean, html: string, errors: string[], validationErrors: object[] }}
 */
function buildPreviewPayload(result) {
    const safe = result && typeof result === 'object' ? result : { html: '', errors: [] };
    const hasErrors = Array.isArray(safe.errors) && safe.errors.length > 0;
    const validationErrors = hasErrors
        ? safe.errors.map(normalizeValidationError)
        : [];
    const normalizedErrors = hasErrors
        ? safe.errors.map(normalizePlainError)
        : [];

    return {
        ok: !hasErrors,
        html: safe.html || '',
        errors: normalizedErrors,
        validationErrors: validationErrors
    };
}

function normalizeValidationError(error) {
    if (typeof error === 'string') {
        return {
            message: error
        };
    }

    return {
        message: (error && (error.message || error.formattedMessage)) || JSON.stringify(error),
        line: error && typeof error.line === 'number' ? error.line : undefined,
        column: error && typeof error.line === 'number' && typeof error.tagNameLine === 'number'
            ? error.tagNameLine
            : undefined,
        tagName: error && typeof error.tagName === 'string' ? error.tagName : undefined,
        formattedMessage: error && error.formattedMessage ? error.formattedMessage : undefined
    };
}

function normalizePlainError(error) {
    if (typeof error === 'string') {
        return error;
    }
    if (error && error.formattedMessage) {
        return error.formattedMessage;
    }
    return JSON.stringify(error);
}

module.exports = {
    buildPreviewPayload: buildPreviewPayload,
    normalizeValidationError: normalizeValidationError,
    normalizePlainError: normalizePlainError
};
