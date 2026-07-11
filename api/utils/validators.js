/**
 * Pure, framework-agnostic validation helpers shared by validation middleware.
 * No Express/DB dependencies here so they stay easy to unit test.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Letters/digits, optionally with internal dashes/underscores (e.g. "SKU-1000", "BOOK_042").
const CODE_REGEX = /^[A-Za-z0-9](?:[A-Za-z0-9_-]{0,48}[A-Za-z0-9])?$/;

const PASSWORD_MIN_LENGTH = 8;

const isValidEmail = (value) =>
    typeof value === 'string' && EMAIL_REGEX.test(value.trim());

const isValidCode = (value) =>
    typeof value === 'string' && CODE_REGEX.test(value.trim());

/**
 * Returns the subset of `fields` that are missing or blank in `body`.
 * A field counts as missing if it's undefined, null, or an empty/whitespace string.
 */
const getMissingFields = (body, fields) =>
    fields.filter((field) => {
        const value = body ? body[field] : undefined;
        return value === undefined || value === null || (typeof value === 'string' && value.trim() === '');
    });

/**
 * Checks that `value` coerces to a finite number within [min, max] (inclusive, either bound optional).
 */
const isValidNumberInRange = (value, { min, max } = {}) => {
    if (value === '' || value === null || value === undefined) return false;
    const num = Number(value);
    if (!Number.isFinite(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
};

/**
 * Returns a human-readable error describing the first unmet password rule, or null if it passes.
 * Rules: 8+ chars, at least one lowercase, one uppercase, one digit, one special character.
 */
const getPasswordStrengthError = (password) => {
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
    }
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character.';
    return null;
};

module.exports = {
    EMAIL_REGEX,
    CODE_REGEX,
    PASSWORD_MIN_LENGTH,
    isValidEmail,
    isValidCode,
    getMissingFields,
    isValidNumberInRange,
    getPasswordStrengthError,
};
