# 🚀 Deploy to GitHub Pages

This guide will help you deploy your Canadian PR Planner app to GitHub Pages for free!

## Prerequisites

- Your code is already pushed to a GitHub repository
- You have admin access to the repository

## Step 1: Update Configuration Files

### 1.1 Update `package.json`

Replace `[YOUR_GITHUB_USERNAME]` and `[YOUR_REPO_NAME]` with your actual values:

```json
{
  "homepage": "https://[YOUR_GITHUB_USERNAME].github.io/[YOUR_REPO_NAME]",
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### 1.2 Update `vite.config.ts`

Replace `[YOUR_REPO_NAME]` with your actual repository name:

```typescript
export default defineConfig({
  plugins: [react()],
  base: "/[YOUR_REPO_NAME]/",
});
```

## Step 2: Enable GitHub Pages

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

## Step 3: Push Your Changes

```bash
git add .
git commit -m "Add GitHub Pages deployment configuration"
git push origin main
```

## Step 4: Monitor Deployment

1. Go to your repository on GitHub
2. Click on **Actions** tab
3. You should see a workflow running called "Deploy to GitHub Pages"
4. Wait for it to complete (usually takes 2-3 minutes)

## Step 5: Access Your App

Once deployment is complete, your app will be available at:

```
https://[YOUR_GITHUB_USERNAME].github.io/[YOUR_REPO_NAME]/
```

## Automatic Deployment

Every time you push changes to the `main` branch, your app will automatically be redeployed!

## Troubleshooting

### If the app doesn't load:

1. Check that the base path in `vite.config.ts` matches your repository name
2. Ensure GitHub Pages is enabled in repository settings
3. Check the Actions tab for any deployment errors

### If assets don't load:

1. Make sure the `base` path in `vite.config.ts` is correct
2. Check that all file paths in your code are relative

## Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Build the app
pnpm build

# Deploy to GitHub Pages
pnpm run deploy
```

## Support

If you encounter any issues, check:

- GitHub Actions logs in the Actions tab
- GitHub Pages settings in repository Settings
- Browser console for any JavaScript errors
