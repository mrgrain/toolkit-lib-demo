import { Toolkit } from "@aws-cdk/toolkit-lib";
import { App } from "aws-cdk-lib/core";
import { PayloadCheckStack } from "./stack";
import { Lambda } from "@aws-sdk/client-lambda";
import { lambdaPayload } from "./iohost";

// Step 0: Setup the Toolkit
const toolkit = new Toolkit({
  sdkConfig: {
    // baseCredentials: BaseCredentials.custom(/** ... */)
  },
});

// Step 1: Create CDK app from an existing source
const _pythonApp = await toolkit.fromCdkApp("python app.py");

// ... or create one inline using the new low-level AssemblyBuilder primitive:
const app = await toolkit.fromAssemblyBuilder(async () => {
  const app = new App();
  new PayloadCheckStack(app, "TestPayloadStack");
  return app.synth();
});

// Step 2: Create cloud assembly from our app
/**
 * Use this to re-use the same cloud assembly later and save on synthesis.
 * Otherwise all actions also take apps directly.
 *
 * ℹ️ await using
 * ECMAScript Explicit Resource Management, see https://tc39.es/proposal-explicit-resource-management/
 */
await using cx = await toolkit.synth(app);

// Step 3: Deploy stack
/**
 * Could also be `await toolkit.deploy(app);`
 */
const deployment = await toolkit.deploy(cx);

// Step 4: Get Lambda ARN and invoke it
/**
 * Access to `deployment.stacks[0].outputs` is one of the newly unlocked features.
 */
const functionArn = deployment.stacks[0].outputs["functionArn"];
const response = await new Lambda().invoke({
  FunctionName: functionArn,
  Payload: JSON.stringify({ payload: await lambdaPayload() }),
});

const responseData = JSON.parse(Buffer.from(response.Payload ?? []).toString());
if (responseData.status !== "ok") {
  throw new Error(responseData.message);
}

console.log(`\n\n✅ Success: ${JSON.stringify(responseData, null, 2)}\n\n`);

// Step 5: Destroy stack
/**
 * We are re-using the previously synth'ed cloud assembly to save time
 */
await toolkit.destroy(cx);
