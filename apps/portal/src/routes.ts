/**
 * An array of public routes that are accessible to all users.
 * @type {string[]}
 */
export const publicRoutes = [
  '/',
  '/account/new-verification',
  '/api/uploadthing',
  '/api/payments',
];

/**
 * An array of routes that will be used for authentication.
 * These routes will redirect logged in users to '/dashboard'
 * @type {string[]}
 */
export const authRoutes = [
  '/account',
  '/account/register',
  '/account/reset',
  '/account/new-password',
];

export const adminRoutes = '/admin';

/**
 * The prefix for api authentication routes
 * Routes that start with this prefix are used for API
 * @type {string}
 */
export const apiAuthPrefix = '/api/auth';

/**
 * The default redirect path after logging in
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = '/';

/**
 * The prefix for template routes
 * Routes that start with this prefix are used for generating templates
 * @type {string}
 */
export const templatePrefix = '/templates';
