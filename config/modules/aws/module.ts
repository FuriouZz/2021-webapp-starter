import { WK } from "../../workflow/types";
import { AWSDeployPlugin } from "./plugin";
import { DeployOptions } from "./types";

export type Options = { aws: Omit<DeployOptions, "input"> & { enabled: boolean } }

export const Hooks: WK.ModuleHooks<Options> = {

  options() {
    return {
      aws: {
        enabled: false,
        input: "public",
        bucket: "mywebsite.com",
      }
    }
  },

  onWebpackUpdate({ webpack, aws, assets }) {
    if (aws.enabled) {
      aws.input = assets.pipeline.output.os()
      webpack.plugins!.push(new AWSDeployPlugin(aws as unknown as DeployOptions))
    }
  }

}
