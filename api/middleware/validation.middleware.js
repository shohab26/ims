const pool = require('../connection');
const {
    isValidEmail,
    isValidCode,
    getMissingFields,
    isValidNumberInRange,
    getPasswordStrengthError,
} = require('../utils/validators');

/**
 * 400s if any of `fields` is missing/blank in req.body.
 */
const validateRequired = (fields) => (req, res, next) => {
    const missing = getMissingFields(req.body, fields);
    if (missing.length > 0) {
        return res.status(400).json({ message: `Missing required field(s): ${missing.join(', ')}.` });
    }
    next();
};

/**
 * 400s if req.body[field] is present but not a valid email.
 * Presence is a separate concern — pair with validateRequired([field]) where the field is mandatory.
 */
const validateEmail = (field = 'email') => (req, res, next) => {
    const value = req.body[field];
    if (value === undefined || value === null || value === '') return next();
    if (!isValidEmail(value)) {
        return res.status(400).json({ message: `${field} must be a valid email address.` });
    }
    next();
};

/**
 * 400s if req.body[field] is present but doesn't look like a product/order code (letters, digits, - and _).
 */
const validateCode = (field) => (req, res, next) => {
    const value = req.body[field];
    if (value === undefined || value === null || value === '') return next();
    if (!isValidCode(value)) {
        return res.status(400).json({
            message: `${field} may only contain letters, numbers, hyphens and underscores (max 50 characters).`,
        });
    }
    next();
};

/**
 * 400s if any configured field is present but outside its numeric range.
 * `rules` example: { price: { min: 0 }, quantity: { min: 0, max: 100000 } }
 */
const validateNumericRanges = (rules) => (req, res, next) => {
    for (const [field, range] of Object.entries(rules)) {
        const value = req.body[field];
        if (value === undefined || value === null || value === '') continue;
        if (!isValidNumberInRange(value, range)) {
            const bounds = [
                range.min !== undefined ? `>= ${range.min}` : null,
                range.max !== undefined ? `<= ${range.max}` : null,
            ].filter(Boolean).join(' and ');
            return res.status(400).json({ message: `${field} must be a number ${bounds}.` });
        }
    }
    next();
};

/**
 * 400s if req.body[field] is present but fails the password strength rules.
 * On update routes, an absent password means "leave unchanged" — that's why we skip rather than require it.
 */
const validatePasswordStrength = (field = 'password') => (req, res, next) => {
    const value = req.body[field];
    if (value === undefined) return next();
    const error = getPasswordStrengthError(value);
    if (error) return res.status(400).json({ message: error });
    next();
};

/**
 * Async DB uniqueness check for things like SKU/product code or email.
 * Excludes the row identified by req.params.id, so updating a record with its own
 * existing value doesn't falsely collide. table/column are developer-supplied
 * constants (never request input), so they're safe to interpolate.
 */
const checkUnique = ({ table, column, field, message }) => async (req, res, next) => {
    const value = req.body[field || column];
    if (value === undefined || value === null || value === '') return next();
    try {
        const excludeId = req.params.id;
        const query = excludeId
            ? `SELECT id FROM ${table} WHERE LOWER(${column}) = LOWER($1) AND id != $2 LIMIT 1`
            : `SELECT id FROM ${table} WHERE LOWER(${column}) = LOWER($1) LIMIT 1`;
        const params = excludeId ? [value, excludeId] : [value];
        const result = await pool.query(query, params);
        if (result.rows.length > 0) {
            return res.status(409).json({ message: message || `${column} '${value}' is already in use.` });
        }
        next();
    } catch (err) {
        res.status(500).json({ message: 'Server error during uniqueness check.', error: err.message });
    }
};

module.exports = {
    validateRequired,
    validateEmail,
    validateCode,
    validateNumericRanges,
    validatePasswordStrength,
    checkUnique,
};
