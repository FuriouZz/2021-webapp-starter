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

  env({ env, aws }) {
    aws.enabled = !env.server
  },

  webpack({ webpack, aws, assets }) {
    if (aws.enabled) {
      aws.input = assets.pipeline.resolve.output().raw()
      webpack.plugins!.push(new AWSDeployPlugin(aws as unknown as DeployOptions))
    }
  }

}
