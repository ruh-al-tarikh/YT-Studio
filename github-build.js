const Build = require('github-build');
const crypto = require('crypto');

// ============================================
// GITHUB OAUTH CONFIGURATION
// ============================================

// For production, use environment variables, NOT hardcoded values!
const config = {
    repo: 'siddharthkp/github-build',      // (author/repo)
    sha: process.env.GIT_COMMIT_SHA || '6954e71d46be1ae9b0529aae6e00b64d7a1023d4',
    token: process.env.GITHUB_TOKEN || 'secret', // Use env var in production!
    label: 'my CI service',
    description: 'checking some stuff',
    url: 'http://my-ci-service.com/builds/1',
    
    // OAuth App settings (add these from your GitHub OAuth App)
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    redirectUri: process.env.GITHUB_REDIRECT_URI || 'http://localhost:3000/callback'
};

// Generate a secure state parameter for CSRF protection
function generateState() {
    return crypto.randomBytes(16).toString('hex');
}

// ============================================
// WEB APPLICATION FLOW (for browsers)
// ============================================

/**
 * Step 1: Redirect user to GitHub for authorization
 */
function redirectToGitHub() {
    const state = generateState();
    // Store state in session/cookie to validate later
    // req.session.oauthState = state;
    
    const params = new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        scope: 'repo,user:email',  // Request specific permissions
        state: state,
        allow_signup: false,
        // Optional: Force account picker
        // prompt: 'select_account'
    });
    
    const authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
    
    // In Express: res.redirect(authUrl)
    console.log('Redirect user to:', authUrl);
    return authUrl;
}

/**
 * Step 2: Handle callback after user authorizes
 */
async function handleGitHubCallback(code, receivedState, expectedState) {
    // Validate state to prevent CSRF attacks
    if (receivedState !== expectedState) {
        throw new Error('State mismatch - possible CSRF attack');
    }
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code: code,
            redirect_uri: config.redirectUri
        })
    });
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
        throw new Error(`OAuth error: ${tokenData.error_description}`);
    }
    
    console.log('Access token obtained:', tokenData.access_token);
    
    // Step 3: Use token to access GitHub API
    const userData = await fetch('https://api.github.com/user', {
        headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/json'
        }
    });
    
    return {
        accessToken: tokenData.access_token,
        scope: tokenData.scope,
        user: await userData.json()
    };
}

// ============================================
// DEVICE FLOW (for CLI/headless applications)
// ============================================

/**
 * Device flow - ideal for CLI tools
 */
async function deviceFlow() {
    // Step 1: Request device and user codes
    const deviceResponse = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            client_id: config.clientId,
            scope: 'repo,user'  // Request specific scopes
        })
    });
    
    const deviceData = await deviceResponse.json();
    
    if (deviceData.error) {
        throw new Error(`Device flow error: ${deviceData.error_description}`);
    }
    
    console.log('\n========================================');
    console.log('🔐 GitHub Authorization Required');
    console.log('========================================');
    console.log(`1. Open this URL: ${deviceData.verification_uri}`);
    console.log(`2. Enter this code: ${deviceData.user_code}`);
    console.log(`3. The code expires in ${Math.floor(deviceData.expires_in / 60)} minutes`);
    console.log('========================================\n');
    
    // Step 2: Poll for authorization
    let interval = deviceData.interval * 1000; // Convert to milliseconds
    let startTime = Date.now();
    let expiresIn = deviceData.expires_in * 1000;
    
    while (Date.now() - startTime < expiresIn) {
        await new Promise(resolve => setTimeout(resolve, interval));
        
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                client_id: config.clientId,
                device_code: deviceData.device_code,
                grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
            })
        });
        
        const tokenData = await tokenResponse.json();
        
        if (tokenData.access_token) {
            console.log('\n✅ Authorization successful!');
            return tokenData.access_token;
        }
        
        // Handle specific errors
        if (tokenData.error === 'authorization_pending') {
            console.log('⏳ Waiting for authorization...');
            continue;
        }
        
        if (tokenData.error === 'slow_down') {
            // Increase interval by 5 seconds as requested
            interval += 5000;
            console.log('🐌 Rate limited, slowing down...');
            continue;
        }
        
        if (tokenData.error === 'expired_token') {
            throw new Error('Authorization code expired. Please restart the process.');
        }
        
        throw new Error(`Polling error: ${tokenData.error_description}`);
    }
    
    throw new Error('Authorization timeout. Please try again.');
}

// ============================================
// BUILD STATUS MANAGEMENT (Original functionality)
// ============================================

async function runBuild() {
    const build = new Build(config);
    
    try {
        // Start the build (pending status)
        console.log('🚀 Starting build...');
        await build.start();
        console.log('✅ Build status set to pending');
        
        // Simulate running your tests
        console.log('\n🧪 Running tests...');
        await runTests(); // Your actual test logic here
        
        // If all tests pass
        console.log('\n✅ All tests passed!');
        await build.pass();
        console.log('✅ Build status set to success');
        
    } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        
        if (error.type === 'config') {
            await build.error();
            console.log('⚠️ Build status set to error');
        } else {
            await build.fail();
            console.log('❌ Build status set to failure');
        }
    }
}

/**
 * Simulated test runner - replace with your actual tests
 */
async function runTests() {
    // Simulate test execution time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random test result for demo
    const shouldPass = Math.random() > 0.3;
    
    if (!shouldPass) {
        const error = new Error('Unit tests failed: 2 failures in main.test.js');
        error.type = 'test';
        throw error;
    }
    
    console.log('  ✓ All 42 tests passed');
}

// ============================================
// ENVIRONMENT VALIDATION
// ============================================

function validateConfig() {
    const required = ['repo', 'sha', 'token'];
    const missing = required.filter(key => !config[key]);
    
    if (missing.length > 0) {
        console.error('Missing required configuration:', missing.join(', '));
        console.error('\nSet environment variables:');
        console.error('  export GITHUB_TOKEN=your_token_here');
        console.error('  export GIT_COMMIT_SHA=$(git rev-parse HEAD)');
        process.exit(1);
    }
}

// ============================================
// MAIN ENTRY POINT
// ============================================

async function main() {
    validateConfig();
    
    // Parse command line arguments
    const args = process.argv.slice(2);
    const command = args[0];
    
    switch (command) {
        case '--web-auth':
            // For web applications
            console.log('Starting web authorization flow...');
            console.log('Redirect URL:', redirectToGitHub());
            break;
            
        case '--device-auth':
            // For CLI tools
            try {
                const token = await deviceFlow();
                console.log('\n🔑 Access token obtained successfully!');
                console.log(`Token: ${token.substring(0, 10)}...`);
                console.log('\nSet this token in your environment:');
                console.log(`export GITHUB_TOKEN=${token}`);
            } catch (error) {
                console.error('Device flow failed:', error.message);
                process.exit(1);
            }
            break;
            
        case '--run-build':
            // Run the build status workflow
            await runBuild();
            break;
            
        default:
            console.log(`
GitHub Build CLI Tool
=====================

Usage:
  node script.js --web-auth     Start web OAuth flow
  node script.js --device-auth  Start device OAuth flow (for CLI)
  node script.js --run-build    Run build with status updates

Environment Variables:
  GITHUB_TOKEN       - Your GitHub personal access token
  GITHUB_CLIENT_ID   - OAuth app client ID (for OAuth flows)
  GITHUB_CLIENT_SECRET - OAuth app client secret (for OAuth flows)
  GIT_COMMIT_SHA     - The commit SHA to update (defaults to script's value)
            `);
            break;
    }
}

// Run the main function
main().catch(err => {
    console.error('Fatal error:', err.message);
    process.exit(1);
});
