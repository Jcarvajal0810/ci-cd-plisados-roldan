/**
 * Admin credentials for the e2e suites. They must come from the environment (the same values as
 * ADMIN_EMAIL / ADMIN_PASSWORD in the root .env) so no password is ever written in the repo.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Set ${name} to run the admin e2e tests (same value as in your .env)`);
  }
  return value;
}

export const ADMIN_EMAIL = process.env['E2E_ADMIN_EMAIL'] ?? 'admin@example.com';
export const ADMIN_PASSWORD = required('E2E_ADMIN_PASSWORD');
