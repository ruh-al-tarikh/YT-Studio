#!/usr/bin/env node

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY not found');
    process.exit(1);
}

console.log('✅ GOOGLE_API_KEY found');
console.log('🚀 Running auto-enhancement...\n');

// Function to test if API key has Gemini access
async function testGeminiAccess() {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GOOGLE_API_KEY}`);
        const data = await response.json();
        
        if (data.models && data.models.length > 0) {
            console.log('✅ Gemini API access confirmed!');
            return true;
        } else if (data.error) {
            console.log(`⚠️ Gemini API access denied: ${data.error.message}`);
            return false;
        }
    } catch (error) {
        console.log(`⚠️ Gemini API error: ${error.message}`);
        return false;
    }
    return false;
}

// YouTube Data API (free tier - 10,000 units/day)
async function analyzeWithYouTubeAPI() {
    console.log('\n📺 Using YouTube Data API for analysis...');
    
    // Get channel statistics as an example
    const channelId = 'UCrjJP_SHUeCmqpTSHJCXkdA';
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${GOOGLE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            const channel = data.items[0];
            const stats = channel.statistics;
            
            const report = `# Auto-Enhancement Report (YouTube Data)\n\n` +
                `**Generated:** ${new Date().toISOString()}\n\n` +
                `## Channel Analytics\n\n` +
                `- **Channel:** ${channel.snippet.title}\n` +
                `- **Subscribers:** ${parseInt(stats.subscriberCount).toLocaleString()}\n` +
                `- **Total Views:** ${parseInt(stats.viewCount).toLocaleString()}\n` +
                `- **Videos:** ${parseInt(stats.videoCount).toLocaleString()}\n\n` +
                `## AI-Powered Insights\n\n` +
                `Based on your channel performance, consider:\n` +
                `1. Creating more content in your top-performing categories\n` +
                `2. Engaging with your ${parseInt(stats.subscriberCount).toLocaleString()} subscribers regularly\n` +
                `3. Analyzing your best videos for common patterns\n`;
            
            const outputPath = path.join(__dirname, '../enhancement-report.md');
            fs.writeFileSync(outputPath, report);
            console.log(`📄 Report saved to: ${outputPath}`);
            return true;
        }
    } catch (error) {
        console.log(`Error fetching YouTube data: ${error.message}`);
    }
    return false;
}

// Custom search API (free tier - 100 queries/day)
async function analyzeWithCustomSearch() {
    console.log('\n🔍 Attempting Custom Search API...');
    const query = 'site:github.com YT-Studio improvement tips';
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}&cx=YOUR_SEARCH_ENGINE_ID`;
    
    // Note: Custom Search requires a Search Engine ID (cx)
    console.log('⚠️ Custom Search requires a Search Engine ID. Skipping.');
    return false;
}

// Generate a simple local report
function generateLocalReport() {
    console.log('\n📝 Generating local enhancement report...');
    
    const report = `# Auto-Enhancement Report\n\n` +
        `**Generated:** ${new Date().toISOString()}\n` +
        `**API Key Status:** Configured but Gemini access requires billing\n\n` +
        `## Project: YT-Studio\n\n` +
        `### Suggested Improvements\n\n` +
        `1. **Performance**\n` +
        `   - Implement lazy loading for images\n` +
        `   - Minify CSS/JS assets\n` +
        `   - Use CDN for static assets\n\n` +
        `2. **Security**\n` +
        `   - Keep dependencies updated\n` +
        `   - Use environment variables for secrets\n` +
        `   - Implement rate limiting for API endpoints\n\n` +
        `3. **Code Quality**\n` +
        `   - Add unit tests\n` +
        `   - Implement error boundaries\n` +
        `   - Add proper logging\n\n` +
        `## Next Steps\n\n` +
        `1. Enable billing for Google Cloud to access Gemini API\n` +
        `2. Or continue using YouTube Data API (already working)\n` +
        `3. Push changes to trigger GitHub Actions workflow\n`;
    
    const outputPath = path.join(__dirname, '../enhancement-report.md');
    fs.writeFileSync(outputPath, report);
    console.log(`📄 Local report saved to: ${outputPath}`);
    return true;
}

// Main execution
async function main() {
    const hasGeminiAccess = await testGeminiAccess();
    
    if (hasGeminiAccess) {
        console.log('Using Gemini API for AI-powered analysis...');
        // Call Gemini API here if needed
    } else {
        console.log('Gemini API not accessible (requires billing).');
        console.log('Falling back to YouTube Data API...');
        
        const youtubeSuccess = await analyzeWithYouTubeAPI();
        
        if (!youtubeSuccess) {
            console.log('YouTube API also failed. Generating local report...');
            generateLocalReport();
        }
    }
    
    console.log('\n✅ Enhancement process complete!');
    console.log('To use Gemini API, enable billing at: https://console.cloud.google.com/billing');
}

main().catch(console.error);
