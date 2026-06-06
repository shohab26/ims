/**
 * Run this script ONCE after running migration_auth_rbac.sql
 * Usage: node seed_superadmin.js
 * Default credentials: admin@inventory.com / Admin@1234
 */

require('dotenv').config();
const pool = require('./connection');
const bcrypt = require('bcryptjs');

async function seed() {
    const email = 'admin@inventory.com';
    const password = 'Admin@1234';
    const fullName = 'Super Admin';

    try {
        // Get super_admin role id
        const roleResult = await pool.query(
            "SELECT id FROM roles WHERE role_name = 'super_admin'"
        );
        if (roleResult.rows.length === 0) {
            console.error('ERROR: super_admin role not found. Run migration_auth_rbac.sql first.');
            process.exit(1);
        }
        const roleId = roleResult.rows[0].id;

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert super admin user
        await pool.query(
            `INSERT INTO users (full_name, email, password_hash, role_id)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (email) DO NOTHING`,
            [fullName, email, passwordHash, roleId]
        );

        console.log('✅ Super Admin seeded successfully!');
        console.log('   Email   :', email);
        console.log('   Password:', password);
        console.log('   ⚠️  Change your password after first login!');
    } catch (err) {
        console.error('Seed error:', err);
    } finally {
        process.exit(0);
    }
}

seed();
