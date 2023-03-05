#!/usr/bin/env node

import chalk from 'chalk'
import cp from 'child_process'
import inquirer from 'inquirer'

const VERSION = '1.3.1'

class ListEntry {
  name!: string
  type!: 'package' | 'cask'

  constructor(options: ListEntry) {
    Object.assign(this, options)
  }

  toString() {
    return `${this.type === 'package' ? '📦' : '🍾'} ${this.name}`
  }

  static parse(line: string): ListEntry {
    const [type, name] = line.split(' ')
    if (!name) throw new Error('Could not parse line')
    if (type === '📦') return new ListEntry({ name, type: 'package' })
    if (type === '🍾') return new ListEntry({ name, type: 'cask' })
    throw new Error('Could not parse type')
  }
}

function checkIfBrewIsInstalled() {
  try {
    cp.execSync('brew --version')
    return true
  } catch (e) {
    return false
  }
}

function getListOfPackages(): ListEntry[] {
  const list = cp.execSync('brew leaves', { encoding: 'utf-8' })
  return list
    .trim()
    .split('\n')
    .map((line) => new ListEntry({ name: line, type: 'package' }))
}

function getListOfCasks(): ListEntry[] {
  const list = cp.execSync('brew list --cask -1', { encoding: 'utf-8' })
  return list
    .trim()
    .split('\n')
    .map((line) => new ListEntry({ name: line, type: 'cask' }))
}

function getList(cask: boolean): ListEntry[] {
  const list = getListOfPackages()
  if (cask) list.push(...getListOfCasks())
  return list
}

function getLoosers(keepers: ListEntry[], leaves: ListEntry[]): ListEntry[] {
  return leaves.filter((leave) => !keepers.some((keeper) => keeper.name === leave.name))
}

async function main() {
  if (!checkIfBrewIsInstalled()) {
    console.log(chalk.red.underline('Brew not installed'))
    return
  }
  console.log(`${chalk.bold.blue('UnBrew')} - Brew cleanup utility\nVersion: ${VERSION}\n`)

  const { cask } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'cask',
      message: `Also consider casks?`,
    },
  ])

  let initialState = getList(cask)

  const { keepers } = await inquirer.prompt([
    {
      type: 'checkbox',
      message: 'Select packages to keep (all by default)',
      name: 'keepers',
      choices: initialState.map((entry) => ({
        name: entry,
        checked: true,
      })),
    },
  ])

  // Uninstalling
  let first = true
  let allUninstalled: ListEntry[] = []
  while (true) {
    // Get all to be uninstalled
    const loosers = getLoosers(keepers, first ? initialState : getList(cask))

    // First time prompt
    if (first) {
      if (loosers.length === 0) {
        console.log(chalk.bold('No package/s selected for deletion.'))
        return
      }
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: `Delelte: ${chalk.bold.blue(loosers.map((l) => l.name).join(', '))} and their dependencies?`,
        },
      ])

      if (!confirmed) {
        console.log(chalk.bold.red('Aborted'))
        return
      }
      console.log('🗑  Uninstalling')
      first = false
    }

    // Actual uninstalling
    if (loosers.length === 0) break
    allUninstalled.push(...loosers)
    cp.execSync(`brew uninstall ${loosers.map((l) => l.name).join(' ')}`)
  }

  console.log('✅ Uninstalled: ' + allUninstalled.join(', '))

  console.log('🧽 Cleaning up')
  cp.execSync(`brew cleanup`)

  console.log(chalk.bold.green('🚀 Done'))
}
main().finally(() => {
  console.log(chalk.blue('👋 Bye Bye'))
})
