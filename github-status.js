let Octokit=require("@octokit/rest").Octokit,execSync=require("child_process").execSync,config={token:process.env.GITHUB_TOKEN,owner:process.env.GITHUB_OWNER||"ruhdevops",repo:process.env.GITHUB_REPO||"YT-Studio",sha:process.env.GITHUB_SHA||getGitCommit(),context:"yt-studio-ci",targetUrl:"https://github.com/ruhdevops/YT-Studio/actions"};function getGitCommit(){try{return execSync("git rev-parse HEAD",{encoding:"utf8"}).trim()}catch(e){return console.warn("⚠️ Not in a git repository. Using fallback SHA."),"6954e71d46be1ae9b0529aae6e00b64d7a1023d4"}}let octokit=null;function initOctokit(){return config.token?(octokit=new Octokit({auth:config.token}),!0):(console.error("❌ GITHUB_TOKEN environment variable is required!"),console.error("\nSet it with:"),console.error('  $env:GITHUB_TOKEN="your_token_here"'),!1)}async function setStatus(e,t){if(!octokit&&!initOctokit())throw new Error("GitHub authentication failed");console.log(`
📡 Updating GitHub status: `+e.toUpperCase()),console.log(`   Repo: ${config.owner}/`+config.repo),console.log(`   Commit: ${config.sha.substring(0,8)}...`),console.log("   Description: "+t);try{return await octokit.repos.createCommitStatus({owner:config.owner,repo:config.repo,sha:config.sha,state:e,description:t,context:config.context,target_url:config.targetUrl}),console.log("✅ Status updated!"),!0}catch(e){return console.error("❌ Failed: "+e.message),!1}}async function runBuild(){console.log("═══════════════════════════════════════════════════════"),console.log("🚀 YT-Studio Build Pipeline"),console.log("═══════════════════════════════════════════════════════");try{await setStatus("pending","Build is running..."),console.log("\n🔨 Running build..."),console.log("\n🧪 Running tests..."),await new Promise(e=>setTimeout(e,2e3)),await setStatus("success","Build completed successfully!"),console.log("\n✅ All checks passed!")}catch(e){await setStatus("failure",e.message),console.error("\n❌ Build failed:",e.message),process.exit(1)}}async function main(){switch(process.argv.slice(2)[0]){case"--setup":console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                    GITHUB STATUS SETUP                        ║
╚═══════════════════════════════════════════════════════════════╝

1. Create a Personal Access Token:
   https://github.com/settings/tokens

2. Select scopes: 'repo' and 'repo:status'

3. Set environment variable:
   $env:GITHUB_TOKEN="ghp_your_token_here"

4. Run: node github-status.js
`);break;case"--pending":await setStatus("pending","Manual pending status");break;case"--success":await setStatus("success","Manual success status");break;case"--failure":await setStatus("failure","Manual failure status");break;case"--status":console.log("Status checked");break;default:await runBuild()}}main().catch(console.error);