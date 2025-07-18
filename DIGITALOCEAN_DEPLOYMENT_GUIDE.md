# DigitalOcean App Platform Deployment Guide for Memelord Wars

This guide provides explicit instructions for deploying the Memelord Wars React application to DigitalOcean App Platform using the App Platform MCP tools, including all discovered workarounds and solutions.

## Prerequisites

1. **DigitalOcean App Platform MCP tools** - Ensure you have access to the MCP server for DigitalOcean
2. **GitHub Repository** - Code must be available in a public GitHub repository
3. **API Keys and Credentials** - Imgflip account and DigitalOcean agent endpoints

## Critical Issues Discovered and Solutions

### Issue 1: package-lock.json Sync Problems

**Problem**: The buildpack fails with `npm ci` errors due to TypeScript version conflicts between package.json and package-lock.json.

**Error Message**: 
```
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync
npm error Invalid: lock file's typescript@5.8.3 does not satisfy typescript@4.9.5
```

**Solution**: Remove package-lock.json from the repository to allow fresh dependency resolution during build.

```bash
rm package-lock.json
git add -A
git commit -m "Remove package-lock.json to fix DigitalOcean buildpack sync issue"
```

### Issue 2: Missing public/index.html

**Problem**: React build fails because public/index.html is missing from the repository.

**Error Message**:
```
Could not find a required file.
  Name: index.html
  Searched in: /workspace/public
```

**Solution**: Ensure public directory is not ignored in .gitignore and commit the public/index.html file.

1. Check .gitignore for `public` entry and remove it:
```gitignore
# Gatsby files
.cache/
# Note: public directory is needed for React apps (contains index.html)
```

2. Add and commit the public directory:
```bash
git add public/
git commit -m "Add public directory with index.html for React build"
```

### Issue 3: Node.js Version Specification

**Problem**: Buildpack uses default Node.js version (22.x) instead of required version.

**Solution**: Specify exact Node.js and npm versions in package.json:

```json
{
  "engines": {
    "node": "18.19.0",
    "npm": "10.2.3"
  }
}
```

### Issue 4: Git Commit Caching

**Problem**: App Platform may cache old commit hashes, causing deployments to use outdated code.

**Solution**: Create a new app if updates don't reflect latest commits, as new apps always fetch the latest code.

## Step-by-Step Deployment Process

### Step 1: Prepare the Repository

1. **Ensure all required files are present and committed**:
   ```bash
   # Check that these files exist and are tracked by git
   git ls-files | grep -E "(package\.json|public/index\.html|src/)"
   ```

2. **Verify package.json has engine specifications**:
   ```json
   {
     "engines": {
       "node": "18.19.0", 
       "npm": "10.2.3"
     }
   }
   ```

3. **Remove problematic package-lock.json if present**:
   ```bash
   rm -f package-lock.json
   git add -A
   git commit -m "Remove package-lock.json for deployment compatibility"
   ```

### Step 2: Create the App using MCP

Use the `mcp__digitalocean-mcp-local__create_app` function:

```json
{
  "header": {
    "Accept": "application/json", 
    "Content-Type": "application/json"
  },
  "body": {
    "spec": {
      "name": "memelord-wars",
      "static_sites": [
        {
          "name": "memelord-wars-frontend",
          "git": {
            "repo_clone_url": "https://github.com/aprildagonese/memelord-wars.git",
            "branch": "master"
          },
          "build_command": "npm install && npm run build",
          "source_dir": "/",
          "output_dir": "build", 
          "index_document": "index.html",
          "error_document": "index.html",
          "envs": [
            {
              "key": "NODE_VERSION",
              "value": "18.19.0",
              "scope": "BUILD_TIME"
            },
            {
              "key": "NPM_VERSION", 
              "value": "10.2.3",
              "scope": "BUILD_TIME"
            },
            {
              "key": "CI",
              "value": "false",
              "scope": "BUILD_TIME"
            },
            {
              "key": "GENERATE_SOURCEMAP",
              "value": "false", 
              "scope": "BUILD_TIME"
            },
            {
              "key": "SKIP_PREFLIGHT_CHECK",
              "value": "true",
              "scope": "BUILD_TIME"
            },
            {
              "key": "REACT_APP_IMGFLIP_USERNAME",
              "value": "adagonese",
              "scope": "BUILD_TIME"
            },
            {
              "key": "REACT_APP_IMGFLIP_PASSWORD",
              "value": "By8Iw5YDc#bx8iLb",
              "scope": "BUILD_TIME",
              "type": "SECRET"
            },
            {
              "key": "REACT_APP_SPICY_AGENT_ENDPOINT", 
              "value": "https://asqsnlyczy56qnwxh2ihnu3v.agents.do-ai.run",
              "scope": "BUILD_TIME"
            },
            {
              "key": "REACT_APP_SPICY_AGENT_API_KEY",
              "value": "aPW4gSccNy7BJPijHb3eUUNe75DsO9m2",
              "scope": "BUILD_TIME",
              "type": "SECRET"
            },
            {
              "key": "REACT_APP_CLASSIC_AGENT_ENDPOINT",
              "value": "https://yci2vjyktz2gx4hi7ch2do3s.agents.do-ai.run",
              "scope": "BUILD_TIME" 
            },
            {
              "key": "REACT_APP_CLASSIC_AGENT_API_KEY",
              "value": "wX54PObqtpBWotdaAVrepNQCjmRpk3eV",
              "scope": "BUILD_TIME",
              "type": "SECRET"
            },
            {
              "key": "REACT_APP_SPICY_MODEL",
              "value": "openai-gpt-4o",
              "scope": "BUILD_TIME"
            },
            {
              "key": "REACT_APP_CLASSIC_MODEL",
              "value": "llama3.3-70b-instruct",
              "scope": "BUILD_TIME"
            },
            {
              "key": "REACT_APP_MODEL_ACCESS_KEY",
              "value": "sk-do-tL1QQa1HLk8TAwGsebDQbjh0QsfO675Gfp8IfBu8yWDirzDOihnm1SAwMG",
              "scope": "BUILD_TIME",
              "type": "SECRET"
            }
          ]
        }
      ],
      "region": "sfo",
      "ingress": {
        "rules": [
          {
            "match": {
              "path": {
                "prefix": "/"
              }
            },
            "component": {
              "name": "memelord-wars-frontend"
            }
          }
        ]
      }
    }
  }
}
```

### Step 3: Monitor the Deployment

1. **Check deployment status**:
   ```javascript
   mcp__digitalocean-mcp-local__get_deployment({
     "path": {"app_id": "your_app_id", "deployment_id": "your_deployment_id"}
   })
   ```

2. **Get build logs if deployment fails**:
   ```javascript
   // Get logs URL
   mcp__digitalocean-mcp-local__get_deployment_logs_url({
     "app_id": "your_app_id",
     "deployment_id": "your_deployment_id", 
     "type": "BUILD"
   })
   
   // Download and read logs
   mcp__digitalocean-mcp-local__download_logs({
     "url": "logs_url_from_previous_call"
   })
   ```

### Step 4: Troubleshooting Common Issues

#### Build Fails with npm ci Error
- **Solution**: Remove package-lock.json from repository
- **Command**: `rm package-lock.json && git commit -am "Remove package-lock.json"`

#### Build Fails with Missing index.html
- **Solution**: Add public directory to git and commit
- **Command**: `git add public/ && git commit -m "Add public directory"`

#### Wrong Node.js Version Used
- **Solution**: Add engines specification to package.json
- **Fix**: Add `"engines": {"node": "18.19.0", "npm": "10.2.3"}` to package.json

#### Old Code Being Deployed
- **Solution**: Create a new app instead of updating existing one
- **Reason**: App Platform may cache commit hashes

## Environment Variables Required

### Build Configuration
| Variable | Value | Type | Description |
|----------|-------|------|-------------|
| `NODE_VERSION` | `18.19.0` | BUILD_TIME | Specify Node.js version |
| `NPM_VERSION` | `10.2.3` | BUILD_TIME | Specify npm version |
| `CI` | `false` | BUILD_TIME | Disable CI strict mode |
| `GENERATE_SOURCEMAP` | `false` | BUILD_TIME | Disable sourcemaps for faster build |
| `SKIP_PREFLIGHT_CHECK` | `true` | BUILD_TIME | Skip React preflight checks |

### Agent Configuration
| Variable | Value | Type | Description |
|----------|-------|------|-------------|
| `REACT_APP_SPICY_AGENT_ENDPOINT` | `https://asqsnlyczy56qnwxh2ihnu3v.agents.do-ai.run` | BUILD_TIME | Spicy agent endpoint |
| `REACT_APP_SPICY_AGENT_API_KEY` | `aPW4gSccNy7BJPijHb3eUUNe75DsO9m2` | SECRET | Spicy agent API key |
| `REACT_APP_CLASSIC_AGENT_ENDPOINT` | `https://yci2vjyktz2gx4hi7ch2do3s.agents.do-ai.run` | BUILD_TIME | Classic agent endpoint |
| `REACT_APP_CLASSIC_AGENT_API_KEY` | `wX54PObqtpBWotdaAVrepNQCjmRpk3eV` | SECRET | Classic agent API key |

### Model Configuration
| Variable | Value | Type | Description |
|----------|-------|------|-------------|
| `REACT_APP_SPICY_MODEL` | `openai-gpt-4o` | BUILD_TIME | Model for spicy agent |
| `REACT_APP_CLASSIC_MODEL` | `llama3.3-70b-instruct` | BUILD_TIME | Model for classic agent |
| `REACT_APP_MODEL_ACCESS_KEY` | `sk-do-tL1QQa1HLk8TAwGsebDQbjh0QsfO675Gfp8IfBu8yWDirzDOihnm1SAwMG` | SECRET | DigitalOcean model access key |

### Imgflip API Configuration
| Variable | Value | Type | Description |
|----------|-------|------|-------------|
| `REACT_APP_IMGFLIP_USERNAME` | `adagonese` | BUILD_TIME | Imgflip API username |
| `REACT_APP_IMGFLIP_PASSWORD` | `By8Iw5YDc#bx8iLb` | SECRET | Imgflip API password |

## Expected Build Process

When successful, the build logs should show:

1. **Git Clone**: Fetches latest code from GitHub
2. **Buildpack Detection**: Detects Node.js, Procfile, and Custom buildpacks
3. **Runtime Environment**: Sets NODE_VERSION=18.19.0
4. **Installing Binaries**: Downloads Node.js 18.19.0 and npm 10.2.3
5. **Installing Dependencies**: Runs `npm install` successfully
6. **Custom Build**: Executes `npm install && npm run build`
7. **React Build**: Creates optimized production build in `build/` directory

## Deployment URL

Once successful, the app will be available at:
```
https://your-app-name-random-hash.ondigitalocean.app
```

## Cost Considerations

- **Starter Tier**: Free tier with limited resources
- **Build Time**: Billable time is typically 8-15 minutes per build attempt
- **Failed Builds**: You are charged for build time even if deployment fails

## Live Demo Considerations

For live conference demos:

1. **Pre-deploy and test** the application thoroughly
2. **Have a backup plan** if live deployment fails
3. **Consider pre-building** the app and showing a working deployment
4. **Test all environment variables** beforehand
5. **Verify agent endpoints** are accessible and working

## Troubleshooting Checklist

- [ ] package-lock.json removed from repository
- [ ] public/index.html file exists and is committed
- [ ] package.json includes engines specification
- [ ] All environment variables are correctly set
- [ ] GitHub repository is public and accessible
- [ ] Latest code is committed and pushed to master branch
- [ ] Imgflip API credentials are valid
- [ ] Agent endpoints are accessible

## Success Indicators

✅ Build logs show Node.js 18.19.0 installation
✅ npm install completes without errors  
✅ React build creates build/ directory successfully
✅ App deploys and is accessible via provided URL
✅ Meme generation works with real API calls

This guide represents lessons learned from multiple deployment attempts and should provide a reliable path to successful deployment of the Memelord Wars application on DigitalOcean App Platform.