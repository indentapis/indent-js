import license from 'rollup-plugin-license'
import { terser } from 'rollup-plugin-terser'
import commonjs from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve'
import typescript from 'rollup-plugin-typescript2'

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD', { encoding: 'utf-8' })
  .trim()

const terserInstance = terser({
  mangle: {
    reserved: ['audit', 'write', 'init'],
    properties: {
      regex: /^_[^_]/
    }
  }
})

const paths = {
  '@sentry/types': ['../types/src']
}

const plugins = [
  typescript({
    tsconfig: 'tsconfig.build.json',
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
        declarationMap: false,
        module: 'ES2015',
        paths
      }
    },
    include: ['*.ts+(|x)', '**/*.ts+(|x)', '../**/*.ts+(|x)']
  }),
  resolve({
    mainFields: ['module']
  })
  // commonjs()
]

const bundleConfig = {
  input: 'src/index.ts',
  output: {
    format: 'iife',
    name: 'Indent',
    sourcemap: true,
    strict: false
  },
  context: 'window',
  plugins: [
    ...plugins,
    license({
      sourcemap: true,
      banner: `/*! @indent/audit <%= pkg.version %> (${commitHash}) | https://github.com/indentapis/indent-js */`
    })
  ]
}

export default [
  // ES5 Browser Bundle
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: 'browser/audit.js'
    }
  },
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: 'browser/audit.min.js'
    },
    // Uglify has to be at the end of compilation, BUT before the license banner
    plugins: bundleConfig.plugins
      .slice(0, -1)
      .concat(terserInstance)
      .concat(bundleConfig.plugins.slice(-1))
  },
  // ------------------
  // ES6 Browser Bundle
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: 'browser/audit.es6.js'
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.build.json',
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
            declarationMap: false,
            module: 'ES2015',
            paths,
            target: 'es6'
          }
        },
        include: ['*.ts+(|x)', '**/*.ts+(|x)', '../**/*.ts+(|x)']
      }),
      ...plugins.slice(1)
    ]
  },
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: 'browser/audit.es6.min.js'
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.build.json',
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
            declarationMap: false,
            module: 'ES2015',
            paths,
            target: 'es6'
          }
        },
        include: ['*.ts+(|x)', '**/*.ts+(|x)', '../**/*.ts+(|x)']
      }),
      ...plugins
        .slice(1)
        .slice(0, -1)
        .concat(terserInstance)
        .concat(bundleConfig.plugins.slice(-1))
    ]
  }
]
