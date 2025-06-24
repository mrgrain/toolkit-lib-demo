import { IIoHost, IoMessage, IoRequest } from "@aws-cdk/toolkit-lib";
import { select } from "@inquirer/prompts";

export class DemoIoHost implements IIoHost {
  async notify(msg: IoMessage<unknown>): Promise<void> {
    // Don't log anything unless it's an error
    if (msg.level === "error") {
      console.log(msg.message);
    }
  }
  async requestResponse<T>(msg: IoRequest<unknown, T>): Promise<T> {
    // This is request from the Toolkit to confirm the destroy action
    // All messages are documented in the message registry:
    // https://docs.aws.amazon.com/cdk/api/toolkit-lib/message-registry/
    if (msg.code === "CDK_TOOLKIT_I7010") {
      return select({
        message: `Clean-up env and delete stack?`,
        choices: [
          {
            name: "Yes",
            value: true,
          },
          {
            name: "No",
            value: false,
          },
        ],
      }) as any;
    }
    return msg.defaultResponse;
  }
}

export async function lambdaPayload() {
  return select({
    message: `Should the integration test ...`,
    choices: [
      {
        name: "✅ Pass",
        value: "test-successful",
      },
      {
        name: "❌ Fail",
        value: "failure",
      },
    ],
  });
}
