# automate-build.ps1 - Complete build automation
param(
    [ValidateSet("dev", "build", "test", "deploy")]
    [string]$Task = "build"
)

$packageJson = @"
{
  "scripts": {
    "clean": "rimraf dist",
    "lint": "eslint src",
    "build:css": "sass src/styles:dist/css",
    "build:js": "esbuild src/index.js --bundle --outfile=dist/bundle.js",
    "build": "npm-run-all clean lint build:*",
    "watch:css": "sass --watch src/styles:dist/css",
    "watch:js": "esbuild src/index.js --bundle --outfile=dist/bundle.js --watch",
    "dev": "npm-run-all --parallel watch:*",
    "test": "jest",
    "test:watch": "jest --watch",
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
"@

Write-Host "Running task: $Task" -ForegroundColor Cyan

switch ($Task) {
    "dev" { npm-run-all --parallel watch:* }
    "build" { npm-run-all clean lint build:* }
    "test" { npm-run-all test }
    "deploy" { npm-run-all predeploy deploy }
}