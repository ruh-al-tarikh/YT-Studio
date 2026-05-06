import { MyWorkflow } from './workflow';

export interface Env {
  MY_WORKFLOW: Workflow<Params>;
}

type Params = {
  userId: string;
  task: string;
  data?: Record<string, any>;
};

export { MyWorkflow };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;

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
          instanceId: instance.id
        });
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    if (url.pathname === "/status" && method === "GET") {
      const instanceId = url.searchParams.get("id");
      if (!instanceId) {
        return Response.json({ error: "Missing instance id" }, { status: 400 });
      }

      try {
        const instance = await env.MY_WORKFLOW.get(instanceId);
        if (!instance) {
          return Response.json({ error: "Workflow not found" }, { status: 404 });
        }

        const status = await instance.status();
        return Response.json({
          instanceId,
          status: status.status,
          output: status.output
        });
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    if (url.pathname === "/list" && method === "GET") {
      try {
        const instances = await env.MY_WORKFLOW.list();
        return Response.json({ instances });
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }
    }

    return Response.json({
      endpoints: {
        "POST /start": "Start a workflow",
        "GET /status?id={id}": "Get status",
        "GET /list": "List all workflows"
      }
    });
  }
};
