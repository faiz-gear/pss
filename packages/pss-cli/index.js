#! /usr/bin/env node

import { execSync } from 'child_process'
import fs from 'fs'
import { resolve } from 'path'
import prompts from 'prompts'

import spinner from './utils/spinner.js'

const promptsOptions = [
  {
    type: 'select',
    name: 'package_manager',
    message: '选择你的项目包管理器',
    choices: [
      {
        title: 'pnpm(强烈推荐🔥)',
        value: 'pnpm'
      },
      {
        title: 'npm',
        value: 'npm'
      },
      {
        title: 'yarn',
        value: 'yarn'
      }
    ]
  }
]

const getInputInfo = () => prompts(promptsOptions)

/**
 *
 * @description 在当前目录读文件
 * @param {*} filename
 * @returns
 */
const readFileSyncInCwd = (filename) => {
  return JSON.parse(fs.readFileSync(resolve(process.cwd(), filename), { encoding: 'utf-8' }))
}
/**
 *
 * @description 在当前工作目录写文件
 * @param {*} filename
 * @param {*} data
 */
const writeFileSyncInCwd = (filename, data) => {
  fs.writeFileSync(resolve(process.cwd(), filename), data)
}

const setupInternal = async () => {
  const { package_manager } = await getInputInfo()
  spinner.setupProjectScript.start()
  // 判断当前是否已经有git 仓库, 没有则init, 为了husky初始化成功
  const gitDir = resolve(process.cwd(), '.git')
  if (!fs.existsSync(gitDir)) {
    // console.log(chalk.blue('未检测到git仓库, 正在初始化空的git仓库...'))
    spinner.initGit.start()
    execSync('git init')
    spinner.initGit.succeed()
  }

  // 安装依赖
  // console.log(chalk.blue(`正在安装依赖，请稍等...`))
  spinner.installDependencies.start()
  const installCommand = {
    node: 'install',
    yarn: 'add',
    pnpm: 'add'
  }
  execSync(
    `${package_manager} ${installCommand[package_manager]} -D eslint eslint-config-prettier eslint-plugin-prettier prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser lint-staged husky commitizen @commitlint/config-conventional @commitlint/cli`
  )
  spinner.installDependencies.succeed()

  // 创建 .editorconfig 文件
  // console.log(chalk.blue('正在创建 .editorconfig 文件...'))
  spinner.createEditorConfig.start()
  const editorConfigContent = `
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
`

  writeFileSyncInCwd('.editorconfig', editorConfigContent)
  spinner.createEditorConfig.succeed()

  // 创建 .prettierrc 文件
  // console.log(chalk.blue('正在创建 .prettierrc 文件...'))
  spinner.createPrettierrcConfig.start()
  const prettierConfigContent = `
{
  "singleQuote": true,
  "trailingComma": "none",
  "printWidth": 120,
  "tabWidth": 2,
  "semi": false,
  "jsxSingleQuote": true
}
`

  writeFileSyncInCwd('.prettierrc', prettierConfigContent)
  spinner.createPrettierrcConfig.succeed()

  // 创建 .eslintrc.cjs 文件
  // console.log(chalk.blue('正在创建 .eslintrc.cjs 文件...'))
  spinner.createEslintrcConfig.start()
  const eslintConfigContent = `
  module.exports = {
    env: {
      node: true,
    },
    parser: '@typescript-eslint/parser',
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
    plugins: ['@typescript-eslint'],
    parserOptions: {
      sourceType: 'module',
      ecmaVersion: 2020,
    },
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  };
`

  writeFileSyncInCwd('.eslintrc.cjs', eslintConfigContent)
  spinner.createEslintrcConfig.succeed()

  // 配置 husky
  // console.log(chalk.blue('正在配置 husky...'))
  spinner.createHuskyConfig.start()
  const huskyInitCommand = {
    npm: 'npx husky-init && npm install',
    yarn: 'npx husky-init --yarn2 && yarn',
    pnpm: 'pnpm dlx husky-init && pnpm install'
  }
  execSync(huskyInitCommand[package_manager])
  writeFileSyncInCwd('.husky/pre-commit', 'npm run lint-staged')
  spinner.createHuskyConfig.succeed()

  // 配置 Commitizen
  const commitizenInitCommand = {
    npm: 'npx commitizen init cz-conventional-changelog --save-dev --save-exact',
    yarn: 'npx commitizen init cz-conventional-changelog --yarn --dev --exact',
    pnpm: 'npx commitizen init cz-conventional-changelog --pnpm --save-dev --save-exact'
  }
  spinner.createCommitizenConfig.start()
  execSync(commitizenInitCommand[package_manager])
  spinner.createCommitizenConfig.succeed()

  // 配置 commitlint
  spinner.createCommitlintConfig.start()
  const commitlintConfigContent = `
module.exports = {
  extends: ['@commitlint/config-conventional']
}
`
  writeFileSyncInCwd('commitlint.config.cjs', commitlintConfigContent)
  execSync('npx husky add .husky/commit-msg "npx --no-install commitlint --edit $1"')
  spinner.createCommitlintConfig.succeed()

  // 配置 lint-staged
  // console.log(chalk.blue('正在配置 lint-staged...'))
  spinner.createLintStagedConfig.start()
  const lintStagedConfigContent = `
{
  "*.{js,jsx,ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "package.json": [
    "prettier --write"
  ],
  "*.vue": [
    "eslint --fix",
    "prettier --write",
  ],
  "*.{scss,less,styl,html}": [
    "prettier --write"
  ],
  "*.md": [
    "prettier --write"
  ]
}
`

  writeFileSyncInCwd('.lintstagedrc', lintStagedConfigContent)
  spinner.createLintStagedConfig.succeed()

  // 读取package.json
  // console.log(chalk.blue('正在配置 scripts...'))
  spinner.configScripts.start()
  const packageJson = readFileSyncInCwd('./package.json')
  // 添加commit
  packageJson.scripts.commit = 'cz'
  // 添加
  packageJson.scripts['lint-staged'] = 'lint-staged'
  packageJson.config = {
    commitizen: {
      path: './node_modules/cz-conventional-changelog'
    }
  }
  writeFileSyncInCwd('./package.json', JSON.stringify(packageJson, null, 2))
  spinner.configScripts.succeed()

  // console.log(chalk.green('前端项目代码规范依赖和配置文件设置完成！'))
  spinner.setupProjectScript.succeed()
}

try {
  setupInternal()
} catch (err) {
  console.log('err', err)
}
