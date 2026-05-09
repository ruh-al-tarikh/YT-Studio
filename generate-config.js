// generate-config.js
const CircleCI = require('@circleci/circleci-config-sdk');

// Instantiate new Config
const myConfig = new CircleCI.Config();

// Create a workflow
const myWorkflow = new CircleCI.Workflow('myWorkflow');
myConfig.addWorkflow(myWorkflow);

// Define an executor (Docker image) – use the correct path
const nodeExecutor = new CircleCI.executors.DockerExecutor('cimg/node:lts');

// Create a job
const nodeTestJob = new CircleCI.Job('node-test', nodeExecutor);
myConfig.addJob(nodeTestJob);

// Add steps to the job
nodeTestJob
  .addStep(new CircleCI.commands.Checkout())
  .addStep(new CircleCI.commands.Run({
    command: 'npm install',
    name: 'NPM Install'
  }))
  .addStep(new CircleCI.commands.Run({
    command: 'npm run test',
    name: 'Run tests'
  }));

// Add the job to the workflow
myWorkflow.addJob(nodeTestJob);

// Write the config file
myConfig.writeFile('.circleci/config.yml');
console.log('✅ CircleCI config written to .circleci/config.yml');
