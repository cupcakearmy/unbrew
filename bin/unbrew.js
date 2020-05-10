#!/usr/bin/env node

const cp = require('child_process')
const chalk = require('chalk')

const inquirer = require('inquirer')

function checkIfBrewIsInstalled() {
  try {
    cp.execSync('brew --version')
    return true
  } catch (e) {
    return false
  }
}

function getListOfLeaves() {
  const list = cp.execSync('brew leaves', { encoding: 'utf-8' })
  return list.trim().split('\n')
}

function getLoosers(keepers) {
  return getListOfLeaves().filter((leave) => !keepers.includes(leave))
}

async function main() {
  if (!checkIfBrewIsInstalled()) {
    console.log(chalk.red.underline('Brew not installed'))
    return
  }

  const { keepers } = await inquirer.prompt([
    {
      type: 'checkbox',
      message: 'Uncheck all unwanted packages',
      name: 'keepers',
      choices: getListOfLeaves().map((leave) => ({
        name: leave,
        checked: true,
      })),
    },
  ])

  console.log('🗑 Uninstalling:', chalk.bold.blue(getLoosers(keepers).join(' ')))
  while (true) {
    const loosers = getLoosers(keepers)
    if (!loosers.length) break

    const joinedLoosers = loosers.join(' ')
    cp.execSync(`brew uninstall ${joinedLoosers}`)
  }
  console.log('🧽 Cleaning up')
  cp.execSync(`brew cleanup`)
  console.log(chalk.bold.green('🚀 Done'))
}
main()
