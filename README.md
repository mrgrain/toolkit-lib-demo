# CDK Toolkit Demo Script

## Resources

Docs: <https://docs.aws.amazon.com/cdk/api/toolkit-lib/README/>
Message registry: <https://docs.aws.amazon.com/cdk/api/toolkit-lib/message-registry/>

## What We're Demonstrating

This demo showcases the new AWS CDK Toolkit library that provides programmatic access to CDK operations like synth, deploy, and destroy directly from TypeScript code.
Instead of using CLI commands like `cdk deploy` and `cdk destroy`, we can now perform these operations directly in our TypeScript code using the Toolkit API.

The demo is implementing a basic integration test scenario:

- Deploy a simple app with a Lambda Function
- Use stack outputs from the deployment result to find the Lambda Function ARN
- Call the Lambda Function as a simulation of an integration test
- Destroy the app

## Demo Flow

- Ensure you are authenticated against your account
- Run `npx tsx demo.ts`

### Step 0: Create Toolkit instance

```typescript
// Use to configure credentials and other global settings
// By default, uses same credential process as the CLI
const toolkit = new Toolkit({
  sdkConfig: {
    // Example how to use entirely custom credentials
    // baseCredentials: BaseCredentials.custom(/** ... */)
  }
});
```

### Step 1: App Creation

```typescript
// Two ways to create a CDK app:
// 1. From existing Python app
const _pythonApp = await toolkit.fromCdkApp('python app.py');

// 2. Inline using AssemblyBuilder
const app = await toolkit.fromAssemblyBuilder(async () => {
  const app = new App();
  new PayloadCheckStack(app, "TestPayloadStack");
  return app.synth();
});
```

### Step 2: Synthesis

```typescript
// Create reusable cloud assembly
await using cx = await toolkit.synth(app);
```

**Key Point**: Synth app once and re-use with later actions.

**Key Point**: The `await using` syntax ensures automatic cleanup when the variable goes out of scope. Alternatively use `await cx.dispose()`.

### Step 3: Deployment

```typescript
const deployment = await toolkit.deploy(cx);
```

**What happens**:

- Creates CloudFormation stack
- Deploys Lambda function with inline code
- Returns deployment metadata including stack outputs

**Key Point**: Could also take an app directly and will synth automatically. However this would always re-synth.

### Step 4: Immediate Resource Interaction

```typescript
const functionArn = deployment.stacks[0].outputs["functionArn"];
const response = await new Lambda().invoke({
  FunctionName: functionArn,
  Payload: JSON.stringify({ payload: "test-successful" }),
});
```

**Key Point**: Direct access to deployed resources without manual ARN lookup.

### Step 5: Cleanup

```typescript
await toolkit.destroy(cx);
```

**Key Point**: Reuses the same cloud assembly to save on a synth.

**Key Point**: Difference to CLI: All actions are implied to be confirmed.
I.e. `destroy` will NOT ask to confirm the removal of the stack.

**Transition** What if someone does want the approval?

### Step 7: IoHost

The Toolkit class has the concept of an `IoHost`.
The point of the IoHost is to separate the actions from the interactions.

Toolkit -> Actions
IoHost -> Interactions

By default Toolkit Library uses a completely non-interactive version of the IoHost, compared to the CLI.
No prompts, no fancy shell output.

```typescript
// Add a custom DemoIoHost
const toolkit = new Toolkit({
  ioHost: new DemoIoHost(),
});
```

**Key Point**: Custom `IoHost`s allow you to fully control the output and interactions.

## Conclusion

- Integration testing pipelines
- Ephemeral environments for testing
- Infrastructure validation scripts
- Automated demos and tutorials
