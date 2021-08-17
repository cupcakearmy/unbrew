#!/usr/bin/env node

import cp from 'child_process'
import chalk from 'chalk'
import inquirer from 'inquirer'

const { version } = require('../package.json')

function checkIfBrewIsInstalled() {
  try {
    cp.execSync('brew --version')
    return true
  } catch (e) {
    return false
  }
}

function getListOfLeaves(): string[] {
  const list = cp.execSync('brew leaves', { encoding: 'utf-8' })
  return list.trim().split('\n')
}

function getLoosers(keepers: string[], leaves = getListOfLeaves()): string[] {
  return leaves.filter((leave) => !keepers.includes(leave))
}

async function main() {
  if (!checkIfBrewIsInstalled()) {
    console.log(chalk.red.underline('Brew not installed'))
    return
  }
  console.log(`${chalk.bold.blue('UnBrew')} - Brew cleanup utility\nVersion: ${version}\n`)

  let leaves: string[]
  let loosers: string[]

  leaves = getListOfLeaves()
  const { keepers } = await inquirer.prompt([
    {
      type: 'checkbox',
      message: 'Select packages to keep (all by default)',
      name: 'keepers',
      choices: leaves.map((leave) => ({
        name: leave,
        checked: true,
      })),
    },
  ])

  loosers = getLoosers(keepers, leaves)
  if (loosers.length === 0) {
    console.log(chalk.bold('No package/s selected for deletion.'))
    return
  }
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `Delelte: ${chalk.bold.blue(loosers.join(' '))}`,
    },
  ])

  if (!confirmed) {
    console.log(chalk.bold.red('Aborted'))
    return
  }

  console.log('🗑  Uninstalling')
  const allLoosers: string[] = []
  while (loosers.length) {
    allLoosers.push(...loosers)
    const joinedLoosers = loosers.join(' ')
    cp.execSync(`brew uninstall ${joinedLoosers}`)
    loosers = getLoosers(keepers)
  }
  console.log('✅ Uninstalled: ' + allLoosers.join(', '))

  console.log('🧽 Cleaning up')
  cp.execSync(`brew cleanup`)

  console.log(chalk.bold.green('🚀 Done'))
}
main().finally(() => {
  console.log(chalk.blue('Bye Bye 👋'))
})
