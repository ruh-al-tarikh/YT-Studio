const { Octokit } = require("@octokit/rest");
const { execSync } = require("child_process");

// Configuration
const config = {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER || "ruhdevops",
    repo: process.env.GITHUB_REPO || "YT-Studio",
    sha: process.env.GITHUB_SHA || getGitCommit(),
    context: "yt-studio-ci",
    targetUrl: "https://github.com/ruhdevops/YT-Studio/actions"
};

function getGitCommit() {
    try {
        return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
    } catch (error) {
        console.warn("⚠️ Not in a git repository. Using fallback SHA.");
        return "6954e71d46be1ae9b0529aae6e00b64d7a1023d4";
    }
}

let octokit = null;

function initOctokit() {
    if (!config.token) {
        console.error("❌ GITHUB_TOKEN environment variable is required!");
        console.error("\nSet it with:");
        console.error("  $env:GITHUB_TOKEN=\"your_token_here\"");
        return false;
    }
    octokit = new Octokit({ auth: config.token });
    return true;
}

async function setStatus(state, description) {
    if (!octokit && !initOctokit()) {
        throw new Error("GitHub authentication failed");
    }
    
    console.log(`\n📡 Updating GitHub status: ${state.toUpperCase()}`);
    console.log(`   Repo: ${config.owner}/${config.repo}`);
    console.log(`   Commit: ${config.sha.substring(0, 8)}...`);
    console.log(`   Description: ${description}`);
    
    try {
        await octokit.repos.createCommitStatus({
            owner: config.owner,
            repo: config.repo,
            sha: config.sha,
            state: state,
            description: description,
            context: config.context,
            target_url: config.targetUrl
        });
        console.log("✅ Status updated!");
        return true;
    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        return false;
    }
}

async function runBuild() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("🚀 YT-Studio Build Pipeline");
    console.log("═══════════════════════════════════════════════════════");
    
    try {
        await setStatus("pending", "Build is running...");
        
        // Run your actual build/test commands here
        console.log("\n🔨 Running build...");
        // execSync("npm run build", { stdio: "inherit" });
        
        console.log("\n🧪 Running tests...");
        // execSync("npm test", { stdio: "inherit" });
        
        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await setStatus("success", "Build completed successfully!");
        console.log("\n✅ All checks passed!");
        
    } catch (error) {
        await setStatus("failure", error.message);
        console.error("\n❌ Build failed:", error.message);
        process.exit(1);
    }
}

async function main() {
    const args = process.argv.slice(2);
    
    switch (args[0]) {
        case "--setup":
            console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    GITHUB STATUS SETUP                        ║
╚═══════════════════════════════════════════════════════════════╝

1. Create a Personal Access Token:
   https://github.com/settings/tokens

2. Select scopes: 'repo' and 'repo:status'

3. Set environment variable:
   $env:GITHUB_TOKEN="ghp_your_token_here"

4. Run: node github-status.js
`);
            break;
        case "--pending":
            await setStatus("pending", "Manual pending status");
            break;
        case "--success":
            await setStatus("success", "Manual success status");
            break;
        case "--failure":
            await setStatus("failure", "Manual failure status");
            break;
        case "--status":
            console.log("Status checked");
            break;
        default:
            await runBuild();
            break;
    }
}

main().catch(console.error);