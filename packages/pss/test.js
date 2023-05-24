import ora from 'ora'
import chalk from 'chalk'

const spinner = ora('Loading unicorns').start()
spinner.succeed(chalk.green('unicorns loaded'))
spinner.fail(chalk.red('unicorns loaded'))
