import ora from 'ora'

const createSpinnerFactory = ({ startMessage, succeedMessage }) => {
  const s = ora(startMessage)
  return {
    start: () => s.start(),
    succeed: () => s.succeed(succeedMessage)
  }
}

const spinner = {
  setupProjectScript: createSpinnerFactory({
    startMessage: '开始设置前端项目代码规范依赖和配置文件设置',
    succeedMessage: '前端项目代码规范依赖和配置文件设置完成！'
  }),
  initGit: createSpinnerFactory({
    startMessage: '未检测到git仓库, 正在初始化空的git仓库...',
    succeedMessage: '初始化git仓库完毕'
  }),
  installDependencies: createSpinnerFactory({
    startMessage: '正在安装依赖，请稍等...',
    succeedMessage: '安装依赖完毕'
  }),
  createEditorConfig: createSpinnerFactory({
    startMessage: '正在配置editorconfig, 请稍等...',
    succeedMessage: 'editorconfig配置完毕'
  }),
  createPrettierrcConfig: createSpinnerFactory({
    startMessage: '正在配置prettierrc, 请稍等...',
    succeedMessage: 'prettierrc配置完毕'
  }),
  createEslintrcConfig: createSpinnerFactory({
    startMessage: '正在配置eslintrc, 请稍等...',
    succeedMessage: 'eslintrc配置完毕'
  }),
  createHuskyConfig: createSpinnerFactory({
    startMessage: '正在配置husky, 请稍等...',
    succeedMessage: 'husky配置完毕'
  }),
  createCommitizenConfig: createSpinnerFactory({
    startMessage: '正在配置commitizen, 请稍等...',
    succeedMessage: 'commitizen配置完毕'
  }),
  createCommitlintConfig: createSpinnerFactory({
    startMessage: '正在配置commitlint, 请稍等...',
    succeedMessage: 'commitlint配置完毕'
  }),
  createLintStagedConfig: createSpinnerFactory({
    startMessage: '正在配置lint-staged, 请稍等...',
    succeedMessage: 'lint-staged配置完毕'
  }),
  configScripts: createSpinnerFactory({
    startMessage: '正在配置scripts, 请稍等...',
    succeedMessage: 'scripts配置完毕'
  })
}

export default spinner
