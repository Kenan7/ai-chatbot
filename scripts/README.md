# Database & Authentication Diagnostic Scripts

This directory contains diagnostic scripts to help troubleshoot authentication and database issues in the AI Chatbot application.

## Prerequisites

1. **Environment Variables**: Make sure you have a `.env.local` file in the project root with:
   ```
   POSTGRES_URL=your_neon_postgres_connection_string
   AUTH_SECRET=your_auth_secret_key
   ```

2. **Dependencies**: Make sure all dependencies are installed:
   ```bash
   npm install
   ```

## Scripts

### 1. `test-db-connection.js`
Tests the basic database connection and operations.

```bash
node scripts/test-db-connection.js
```

**What it tests:**
- Basic Postgres connection to Neon database
- User table structure and existence
- Basic CRUD operations on the User table
- Guest user creation logic

### 2. `test-auth-flow.js`
Tests the specific authentication flow that's failing.

```bash
node scripts/test-auth-flow.js
```

**What it tests:**
- `generateUUID()` function
- `generateHashedPassword()` function
- `createGuestUser()` function logic
- Concurrent guest user creation

### 3. `debug-auth-error.js`
Comprehensive debugging script for the authentication error.

```bash
node scripts/debug-auth-error.js
```

**What it tests:**
- Environment variable loading
- Database connection in Next.js-like environment
- Exact simulation of the failing authentication flow
- Detailed error diagnostics

## Running the Scripts

```bash
node scripts/test-db-connection.js
node scripts/test-auth-flow.js
node scripts/debug-auth-error.js
```

## Expected Output

If everything is working correctly, you should see:
- ✅ Green checkmarks for successful operations
- Detailed information about database structure
- Successful user creation and cleanup

If there are issues, you'll see:
- ❌ Red X marks for failed operations
- Detailed error messages with diagnostic information
- 💡 Troubleshooting suggestions
