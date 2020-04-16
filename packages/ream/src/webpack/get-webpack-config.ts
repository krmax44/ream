import WebpackChain from 'webpack-chain'
import { Ream } from '../'
import { setOutput } from './blocks/output'
import { setResolve } from './blocks/resolve'
import { setHotReloading } from './blocks/hot-reload'
import { bundleForNode } from './blocks/bundle-for-node'
import { useBabel } from './blocks/babel'
import { useVue } from './blocks/vue'
import { useCSS } from './blocks/css'
import { defineConstants } from './blocks/constants'
import { useProgressBar } from './blocks/progress-bar'
import { printErrors } from './blocks/print-errors'

export function getWebpackConfig(type: 'client' | 'server', api: Ream) {
  const chain = new WebpackChain()
  const isClient = type === 'client'

  chain.mode(api.isDev ? 'development' : 'production')

  // Sourcemap is disabled in production
  if (isClient) {
    chain.devtool(api.isDev ? '#cheap-module-eval-source-map' : false)
  } else {
    chain.devtool(api.isDev ? '#source-map' : false)
  }

  setOutput(api, chain, isClient)
  setResolve(api, chain)
  setHotReloading(api, chain, isClient)
  bundleForNode(chain, isClient)
  useBabel(api, chain, isClient)

  chain.plugin('timefix').use(require('time-fix-plugin'))

  useVue(chain, isClient)

  useCSS(chain)

  defineConstants(api, chain, isClient)

  useProgressBar(chain, isClient)

  printErrors(chain)

  const config = chain.toConfig()
  // webpack-chain itself doesn't support async entry
  // so we manually set entry here
  config.entry = () => api.getEntry(isClient)

  if (process.env.DEBUG?.includes('webpack')) {
    console.log(chain.toString())
  }

  return config
}
