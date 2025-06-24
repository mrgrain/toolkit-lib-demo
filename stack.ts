import * as cdk from "aws-cdk-lib/core";
import type { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class PayloadCheckStack extends cdk.Stack {
  public readonly functionArn: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const payloadCheckLambda = new lambda.Function(this, "PayloadCheckLambda", {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: "index.handler",
      code: lambda.Code.fromInline(`// example handler code
exports.handler = async function (event) {
  if (event.payload === 'test-successful') {
    return { "status": "ok", "message": "All good!" };
  } else {
    return {"status": "error", "message": "Invalid payload!"};
  }
}`),
    });

    new cdk.CfnOutput(this, "functionArn", {
      value: payloadCheckLambda.functionArn,
    });
  }
}

