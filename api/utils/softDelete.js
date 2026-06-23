/**
 * Soft delete + restore helpers.
 *
 * Replaces hard DELETE with an UPDATE that flips is_deleted/deleted_at/deleted_by.
 * Both helpers are idempotent: re-soft-deleting an already-trashed row is a no-op,
 * and restoring an already-active row is a no-op.
 *
 * The `is_deleted` guard in the WHERE clause is what makes them idempotent —
 * second-soft-delete returns rowCount=0 (treated as 404 by the caller), and
 * restoring a row that was never deleted returns rowCount=0 too.
 *
 * Note: invoice_items are NOT routed through these helpers — they get soft-deleted
 * as a side effect of soft-deleting the parent invoice, in a single transaction
 * inside invoiceController. See invoiceController.deleteById for the pattern.
 */

const SOFT_DELETE_COLUMNS = Object.freeze(['is_deleted', 'deleted_at', 'deleted_by']);

/**
 * Soft-delete a row by id. Sets the three columns and returns the row count.
 * Returns 0 if the row is already trashed or doesn't exist.
 */
const softDeleteById = async (pool, table, id, userId) => {
    const result = await pool.query(
        `UPDATE ${table}
         SET is_deleted = TRUE,
             deleted_at = NOW(),
             deleted_by = $2
         WHERE id = $1 AND is_deleted = FALSE`,
        [id, userId]
    );
    return result.rowCount;
};

/**
 * Restore a previously soft-deleted row by id. Clears the three columns.
 * Returns 0 if the row is already active or doesn't exist.
 */
const restoreById = async (pool, table, id) => {
    const result = await pool.query(
        `UPDATE ${table}
         SET is_deleted = FALSE,
             deleted_at = NULL,
             deleted_by = NULL
         WHERE id = $1 AND is_deleted = TRUE`,
        [id]
    );
    return result.rowCount;
};

module.exports = { SOFT_DELETE_COLUMNS, softDeleteById, restoreById };
