#!/usr/bin/env node
// Generate a JSON file with the latest N commits (hash, date ISO, subject)
// Output: src/generated/commits.json

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const N = Number(process.env.CHANGELOG_COUNT || 12)

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8' })
}

try {
  const format = '%H|%ad|%s'
  const logCmd = `git log -n ${N} --pretty=format:'${format}' --date=iso`
  const raw = run(logCmd)
  const lines = raw.split('\n').map(s => s.trim()).filter(Boolean)
  const commits = lines.map(line => {
    const parts = line.split('|')
    const hash = parts[0]
    const date = parts[1]
    const subject = parts.slice(2).join('|')
    return { hash, date, subject }
  })

  const outDir = path.join(__dirname, '..', 'src', 'generated')
  fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'commits.json')
  fs.writeFileSync(outFile, JSON.stringify(commits, null, 2))
  console.log(`✅ Généré ${commits.length} commits dans ${path.relative(process.cwd(), outFile)}`)
} catch (e) {
  console.error('❌ Échec de la génération du changelog JSON:', e.message)
  process.exit(1)
}