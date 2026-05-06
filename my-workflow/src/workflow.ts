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
