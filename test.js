console.log("GitHub Status Tool");
console.log("==================");
console.log("Token:", process.env.GITHUB_TOKEN ? "✓ Set" : "✗ Missing");
console.log("Owner:", process.env.GITHUB_OWNER || "ruhdevops");
console.log("Repo:", process.env.GITHUB_REPO || "YT-Studio");
console.log("\nTo update GitHub status, install: npm install @octokit/rest");
