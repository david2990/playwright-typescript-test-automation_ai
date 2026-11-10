import 'dotenv/config';

/**
 * Single source of truth for environment-specific configuration.
 * Everything is read once here so tests and page objects never touch process.env.
 */
const baseUrl = process.env.BASE_URL?.trim() || 'https://demowebshop.tricentis.com';
const email = process.env.TEST_USER?.trim() ?? '';
const password = process.env.TEST_PASS ?? '';

export const env = {
  baseUrl,
  credentials: { email, password },
  hasCredentials: email.length > 0 && password.length > 0,
} as const;

export function requireCredentials(): { email: string; password: string } {
  if (!env.hasCredentials) {
    throw new Error(
      'TEST_USER and TEST_PASS must be set (copy .env.example to .env, or configure the Jenkins credentials).',
    );
  }
  return env.credentials;
}
