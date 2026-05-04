# Cloudflare Workflow Setup Script
# Run this script in your project directory to create all necessary files

Write-Host "🚀 Setting up Cloudflare Workflow Project..." -ForegroundColor Cyan
Write-Host ""

# Create directories if they don't exist
$directories = @("src", "dist")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Created directory: $dir" -ForegroundColor Green
    }
}

# Create .gitignore
Write-Host "📝 Creating .gitignore..." -ForegroundColor Yellow
@'
# Dependencies
node_modules/

# Build output
dist/
*.tsbuildinfo

# Wrangler
.wrangler/
.dev.vars*
wrangler-local.json

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
desktop.ini

# Environment files
.env
.env.local
.env.*.local
.env.production
.env.development

# Logs
*.log
npm-debug.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output/

# Temporary files
*.tmp
*.temp
.cache/

# Workflow specific
workflow-instances.json
'@ | Out-File -FilePath .gitignore -Encoding utf8
Write-Host "✅ Created .gitignore" -ForegroundColor Green

# Create wrangler.jsonc
Write-Host "📝 Creating wrangler.jsonc..." -ForegroundColor Yellow
@'
/**
 * For more details on how to configure Wrangler, refer to:
 * https://developers.cloudflare.com/workers/wrangler/configuration/
 */
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-workflow",
  "main": "src/index.ts",
  "compatibility_date": "2026-05-04",
  "observability": {
    "enabled": true
  },
  "upload_source_maps": true,
  "compatibility_flags": [
    "nodejs_compat"
  ],
  "workflows": [
    {
      "name": "my-workflow",
      "binding": "MY_WORKFLOW",
      "class_name": "MyWorkflow"
    }
  ],
  "vars": {
    "ENVIRONMENT": "development"
  }
}
'@ | Out-File -FilePath wrangler.jsonc -Encoding utf8
Write-Host "✅ Created wrangler.jsonc" -ForegroundColor Green

# Create src/workflow.ts
Write-Host "📝 Creating src/workflow.ts..." -ForegroundColor Yellow
@'
import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';

// Define the parameters your workflow expects
type Params = {
  userId: string;
  task: string;
  data?: Record<string, any>;
};

// Define the return type
type ReturnValue = {
  success: boolean;
  message: string;
  data: any;
  stepsCompleted: string[];
};

export class MyWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep): Promise<ReturnValue> {
    const stepsCompleted: string[] = [];
    
    // Step 1: Validate input
    const validation = await step.do("validate-input", async () => {
      if (!event.payload.userId) {
        throw new Error("userId is required");
      }
      if (!event.payload.task) {
        throw new Error("task is required");
      }
      return { 
        valid: true, 
        timestamp: new Date().toISOString(),
        validatedFields: Object.keys(event.payload)
      };
    });
    stepsCompleted.push("validate-input");
    console.log(`✅ Step 1 completed: Input validated for user ${event.payload.userId}`);
    
    // Step 2: Fetch user data (simulate API call)
    const userData = await step.do("fetch-user-data", async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        id: event.payload.userId,
        name: `User ${event.payload.userId}`,
        email: `user${event.payload.userId}@example.com`,
        fetchedAt: new Date().toISOString()
      };
    });
    stepsCompleted.push("fetch-user-data");
    console.log(`✅ Step 2 completed: User data fetched for ${userData.name}`);
    
    // Step 3: Process the task
    const taskResult = await step.do("process-task", async () => {
      let processedData = {};
      switch (event.payload.task) {
        case "analyze":
          processedData = {
            analysis: "Data analysis completed",
            insights: ["Insight 1", "Insight 2"],
            confidence: 0.95
          };
          break;
        case "transform":
          processedData = {
            transformation: "Data transformed successfully",
            originalSize: JSON.stringify(event.payload.data).length,
            transformedSize: JSON.stringify(event.payload.data).length * 0.7
          };
          break;
        default:
          processedData = {
            processed: true,
            task: event.payload.task,
            data: event.payload.data || {}
          };
      }
      return {
        task: event.payload.task,
        status: "completed",
        data: processedData,
        processedAt: new Date().toISOString()
      };
    });
    stepsCompleted.push("process-task");
    console.log(`✅ Step 3 completed: Task "${event.payload.task}" processed`);
    
    // Step 4: Save results
    const saved = await step.do("save-results", async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return { 
        saved: true, 
        savedAt: new Date().toISOString(),
        recordId: `rec_${Date.now()}_${event.payload.userId}`
      };
    });
    stepsCompleted.push("save-results");
    console.log(`✅ Step 4 completed: Results saved with ID ${saved.recordId}`);
    
    // Step 5: Send notification
    const notification = await step.do("send-notification", async () => {
      return {
        sent: true,
        method: "webhook",
        timestamp: new Date().toISOString(),
        message: `Workflow completed for user ${event.payload.userId}`
      };
    });
    stepsCompleted.push("send-notification");
    console.log(`✅ Step 5 completed: Notification sent`);
    
    // Return final result
    return {
      success: true,
      message: "Workflow completed successfully",
      data: {
        user: userData,
        task: taskResult,
        validation: validation,
        saved: saved,
        notification: notification,
        summary: {
          totalSteps: stepsCompleted.length,
          steps: stepsCompleted,
          startedAt: validation.timestamp,
          completedAt: new Date().toISOString()
        }
      },
      stepsCompleted
    };
  }
}
'@ | Out-File -FilePath src/workflow.ts -Encoding utf8
Write-Host "✅ Created src/workflow.ts" -ForegroundColor Green

# Create src/index.ts
Write-Host "📝 Creating src/index.ts..." -ForegroundColor Yellow
@'
export interface Env {
  MY_WORKFLOW: Workflow<Params>;
}

type Params = {
  userId: string;
  task: string;
  data?: Record<string, any>;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    
    // Start a new workflow
    if (url.pathname === "/start" && method === "POST") {
      try {
        const body = await request.json();
        const instanceId = crypto.randomUUID();
        
        const instance = await env.MY_WORKFLOW.create({
          id: instanceId,
          params: {
            userId: body.userId || "anonymous",
            task: body.task || "default-task",
            data: body.data || {}
          }
        });
        
        return Response.json({
          success: true,
          message: "Workflow started",
          instanceId: instance.id,
          status: await instance.status()
        });
      } catch (error) {
        return Response.json({
          success: false,
          error: error.message
        }, { status: 500 });
      }
    }
    
    // Get workflow status
    if (url.pathname === "/status" && method === "GET") {
      const instanceId = url.searchParams.get("id");
      if (!instanceId) {
        return Response.json({ error: "Missing instance id" }, { status: 400 });
      }
      
      try {
        const instance = await env.MY_WORKFLOW.get(instanceId);
        if (!instance) {
          return Response.json({ error: "Workflow instance not found" }, { status: 404 });
        }
        
        const status = await instance.status();
        return Response.json({
          instanceId,
          status: status.status,
          output: status.output,
          error: status.error,
          createdAt: status.createdAt,
          modifiedAt: status.modifiedAt
        });
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }
    
    // List all workflow instances
    if (url.pathname === "/list" && method === "GET") {
      try {
        const instances = await env.MY_WORKFLOW.list();
        return Response.json({
          instances: instances.map(i => ({
            id: i.id,
            status: i.status
          }))
        });
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }
    
    // Terminate a workflow
    if (url.pathname === "/terminate" && method === "POST") {
      try {
        const body = await request.json();
        const instanceId = body.instanceId;
        if (!instanceId) {
          return Response.json({ error: "Missing instance id" }, { status: 400 });
        }
        
        const instance = await env.MY_WORKFLOW.get(instanceId);
        if (!instance) {
          return Response.json({ error: "Workflow not found" }, { status: 404 });
        }
        
        await instance.terminate();
        return Response.json({
          success: true,
          message: `Workflow ${instanceId} terminated`
        });
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }
    
    // Help endpoint
    return Response.json({
      service: "Cloudflare Workflow API",
      version: "1.0.0",
      endpoints: {
        "POST /start": "Start a new workflow - Body: { userId, task, data }",
        "GET /status?id={instanceId}": "Get workflow status",
        "GET /list": "List all workflow instances",
        "POST /terminate": "Terminate a workflow - Body: { instanceId }"
      }
    });
  }
};
'@ | Out-File -FilePath src/index.ts -Encoding utf8
Write-Host "✅ Created src/index.ts" -ForegroundColor Green

# Create package.json
Write-Host "📝 Creating package.json..." -ForegroundColor Yellow
@'
{
  "name": "my-workflow",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:prod": "wrangler deploy --env production",
    "start": "wrangler dev",
    "build": "tsc",
    "cf-typegen": "wrangler types",
    "login": "wrangler login",
    "whoami": "wrangler whoami"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20250504.0",
    "typescript": "^5.4.5",
    "wrangler": "^4.87.0"
  },
  "dependencies": {},
  "private": true
}
'@ | Out-File -FilePath package.json -Encoding utf8
Write-Host "✅ Created package.json" -ForegroundColor Green

# Create tsconfig.json
Write-Host "📝 Creating tsconfig.json..." -ForegroundColor Yellow
@'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types"],
    "moduleResolution": "node",
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": false,
    "removeComments": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
'@ | Out-File -FilePath tsconfig.json -Encoding utf8
Write-Host "✅ Created tsconfig.json" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 All files created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Next steps:" -ForegroundColor Cyan
Write-Host "1. Install dependencies: pnpm install" -ForegroundColor White
Write-Host "2. Login to Cloudflare: pnpm run login" -ForegroundColor White
Write-Host "3. Generate types: pnpm run cf-typegen" -ForegroundColor White
Write-Host "4. Deploy: pnpm run deploy" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Or run all commands automatically:" -ForegroundColor Yellow
Write-Host "   pnpm install && pnpm run login && pnpm run cf-typegen && pnpm run deploy" -ForegroundColor White
Write-Host ""

# Optional: Ask if user wants to install dependencies now
$installNow = Read-Host "Do you want to install dependencies now? (y/n)"
if ($installNow -eq 'y') {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    pnpm install
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
    
    $loginNow = Read-Host "Do you want to login to Cloudflare now? (y/n)"
    if ($loginNow -eq 'y') {
        Write-Host "🔐 Logging into Cloudflare..." -ForegroundColor Yellow
        pnpm run login
    }
    
    $deployNow = Read-Host "Do you want to deploy now? (y/n)"
    if ($deployNow -eq 'y') {
        Write-Host "🚀 Deploying to Cloudflare..." -ForegroundColor Yellow
        pnpm run deploy
    }
}