import { resolve, relative } from 'path'
import { Ream } from 'ream/src'
import WebpackChain from 'webpack-chain'

export function setOutput(api: Ream, chain: WebpackChain, isClient: boolean) {
  chain.output.devtoolModuleFilenameTemplate(
    // Point sourcemap entries to original disk location (format as URL on Windows)
    api.isDev
      ? (info: any) => resolve(info.absoluteResourcePath).replace(/\\/g, '/')
      : (info: any) =>
          relative(api.resolveRoot(), info.absoluteResourcePath).replace(
            /\\/g,
            '/'
          )
  )

  chain.output.jsonpFunction(`reamJsonp`)

  // Add /* filename */ comments to generated require()s in the output.
  chain.output.pathinfo(api.isDev)

  chain.output
    .path(api.resolveDotReam(isClient ? 'client' : 'server'))
    .publicPath('/_ream/')
}
