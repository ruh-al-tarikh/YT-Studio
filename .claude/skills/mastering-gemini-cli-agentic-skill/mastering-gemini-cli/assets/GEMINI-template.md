# Project Context

## Role

You are a [ROLE: e.g., Senior Software Engineer, Documentation Writer, QA Engineer].

## Task

[PRIMARY OBJECTIVE: What is the agent's main job?]

## Constraints

- [CONSTRAINT 1: What should the agent NEVER do?]
- [CONSTRAINT 2: What files/directories are off-limits?]
- [CONSTRAINT 3: What patterns must be preserved?]
- Never modify files outside the specified directories
- Always preserve existing error handling
- Do not delete comments marked TODO or FIXME

## Style

- [INDENTATION: e.g., 2 spaces, 4 spaces, tabs]
- [QUOTES: e.g., single quotes, double quotes]
- [NAMING: e.g., camelCase, snake_case, PascalCase]
- [LANGUAGE FEATURES: e.g., async/await over callbacks]

## Domain Knowledge

[PROJECT-SPECIFIC FACTS: Framework, database, architecture patterns]

Example:
- Framework: Express.js with TypeScript
- Database: PostgreSQL via Prisma ORM
- Auth: JWT tokens in httpOnly cookies
- Tests: Jest with supertest

## External References

@./docs/api-schema.md
@./docs/coding-standards.md

## Logging (Optional)

After every action, append timestamped summary to session_log.md:
```
[YYYY-MM-DD HH:MM:SS] ACTION: description
[YYYY-MM-DD HH:MM:SS] RESULT: outcome
```

## Edit Failures (Optional)

If Edit fails twice on same target:
1. Use ReadFile to reload current file state
2. Identify correct section from fresh content
3. Retry with exact content from ReadFile
