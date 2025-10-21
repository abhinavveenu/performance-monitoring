# Publishing Guide for perf-monitor-sdk

**✅ PUBLISHED:** https://www.npmjs.com/package/perf-monitor-sdk

This guide explains how the SDK package was published to npm and how to publish future updates.

## Prerequisites

1. **npm Account**: You need an npm account. Create one at https://www.npmjs.com/signup

2. **npm CLI**: Ensure npm is installed and you're logged in:
   ```bash
   npm whoami
   ```
   
   If not logged in:
   ```bash
   npm login
   ```

3. **Current Package**: Published as `perf-monitor-sdk` (unscoped)
   - View at: https://www.npmjs.com/package/perf-monitor-sdk
   - No organization required for updates

## Pre-Publication Checklist

- [ ] All tests passing
- [ ] Version number updated in `package.json`
- [ ] `CHANGELOG.md` updated with changes
- [ ] `README.md` is complete and accurate
- [ ] Repository URL updated in `package.json`
- [ ] Build succeeds: `npm run build`
- [ ] Package contents verified: `npm pack --dry-run`

## Publishing Steps

### 1. Update Version

Follow [Semantic Versioning](https://semver.org/):

```bash
# Patch release (bug fixes): 1.0.0 -> 1.0.1
npm version patch

# Minor release (new features): 1.0.0 -> 1.1.0
npm version minor

# Major release (breaking changes): 1.0.0 -> 2.0.0
npm version major
```

Or manually update `version` in `package.json`.

### 2. Build the Package

```bash
npm run build
```

This will:
- Clean the `dist` directory
- Compile TypeScript to JavaScript
- Generate type definitions
- Bundle with Rollup (ESM, CJS, UMD)
- Minify with Terser

### 3. Test the Package Locally

Create a test tarball:
```bash
npm pack
```

This creates a `.tgz` file. Test it in another project:
```bash
cd /path/to/test-project
npm install /path/to/@perf-monitor-sdk-1.0.0.tgz
```

### 4. Verify Package Contents

```bash
npm pack --dry-run
```

Ensure only these files are included:
- `dist/` (all build artifacts)
- `README.md`
- `LICENSE`
- `package.json`

NOT included (filtered by `.npmignore`):
- `src/`
- `node_modules/`
- `tsconfig.json`
- `rollup.config.js`

### 5. Publish to npm

**For first-time publication:**

If using scoped package (`@perf-monitor/sdk`):
```bash
# Public package (free)
npm publish --access public

# Private package (requires paid plan)
npm publish --access restricted
```

If using unscoped package (`perf-monitor-sdk`):
```bash
npm publish
```

**For updates:**
```bash
npm publish
```

### 6. Verify Publication

Check on npm:
```bash
npm view @perf-monitor/sdk
```

Or visit: https://www.npmjs.com/package/@perf-monitor/sdk

### 7. Tag the Release (Git)

```bash
git tag v1.0.0
git push origin v1.0.0
```

## Package Name Options

### Option 1: Keep Scoped Name

**Name:** `@perf-monitor/sdk`

**Requirements:**
- Create npm organization `perf-monitor`: https://www.npmjs.com/org/create
- Organization name must match scope
- Free for public packages

**Pros:**
- Professional namespacing
- Prevents name conflicts
- Can group related packages

**Cons:**
- Requires organization

### Option 2: Use Unscoped Name

**Update `package.json`:**
```json
{
  "name": "perf-monitor-sdk",
  ...
}
```

**Pros:**
- No organization needed
- Simpler to publish

**Cons:**
- Name might be taken
- No namespacing
- Check availability: `npm view perf-monitor-sdk`

## Troubleshooting

### Error: Package name taken

```bash
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@perf-monitor%2fsdk
```

**Solutions:**
1. Create the organization on npm
2. Change package name to something unique
3. Add your username as scope: `@yourusername/perf-monitor-sdk`

### Error: Not logged in

```bash
npm ERR! need auth
```

**Solution:**
```bash
npm login
```

### Error: Permission denied

```bash
npm ERR! 403 Forbidden
```

**Solutions:**
1. Check you're logged into correct account: `npm whoami`
2. For scoped packages, ensure you have access to organization
3. Use `--access public` for scoped public packages

### Error: Version already published

```bash
npm ERR! 403 Forbidden - PUT https://registry.npmjs.org/@perf-monitor%2fsdk
npm ERR! You cannot publish over the previously published versions
```

**Solution:**
Update version number in `package.json` and try again.

## Automation with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      
      - run: npm ci
      - run: npm run build
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

**Setup:**
1. Get npm token: https://www.npmjs.com/settings/your-username/tokens
2. Add as GitHub secret: `NPM_TOKEN`
3. Create release on GitHub to trigger publish

## Quick Reference

```bash
# One-time setup
npm login

# For each release
npm version patch              # Update version
npm run build                  # Build package
npm pack --dry-run            # Verify contents
npm publish --access public   # Publish

# Verify
npm view @perf-monitor/sdk
```

## Unpublishing (Emergency Only)

**Warning:** Unpublishing is discouraged and has restrictions.

```bash
# Within 72 hours of publishing
npm unpublish @perf-monitor/sdk@1.0.0

# Unpublish entire package (dangerous!)
npm unpublish @perf-monitor/sdk --force
```

**Better approach:** Publish a patch version with fixes instead.

## Beta/Alpha Releases

For pre-release versions:

```bash
# Update version
npm version 1.1.0-beta.0

# Publish with tag
npm publish --tag beta

# Users install with tag
npm install @perf-monitor/sdk@beta
```

## Support

- npm CLI docs: https://docs.npmjs.com/cli/v9/commands/npm-publish
- npm support: https://www.npmjs.com/support
- Semantic Versioning: https://semver.org/

