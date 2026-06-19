import { readFile, readdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const files = (await readdir(root, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && ['.json', '.n8n'].includes(extname(entry.name)))
  .map((entry) => entry.name)

const credentialLabel = (type) => `YOUR_${type.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/[^a-z0-9]+/gi, '_').toUpperCase()}_CREDENTIAL_ID`

function sanitize(value, key = '') {
  if (Array.isArray(value)) return value.map((item) => sanitize(item))
  if (!value || typeof value !== 'object') return value

  if (key === 'documentId') {
    if ('value' in value) return { ...value, value: 'YOUR_SPREADSHEET_ID' }
    return 'YOUR_SPREADSHEET_ID'
  }

  if (key === 'credentials') {
    return Object.fromEntries(Object.entries(value).map(([type, credential]) => [type, {
      ...credential,
      id: credentialLabel(type),
      name: `${type} credential`,
    }]))
  }

  return Object.fromEntries(Object.entries(value).map(([childKey, childValue]) => {
    if (childKey === 'documentId') {
      return [childKey, typeof childValue === 'object'
        ? { ...childValue, value: 'YOUR_SPREADSHEET_ID' }
        : 'YOUR_SPREADSHEET_ID']
    }
    if (childKey === 'organization' && /^\d+$/.test(String(childValue))) {
      return [childKey, 'YOUR_LINKEDIN_ORGANIZATION_ID']
    }
    return [childKey, sanitize(childValue, childKey)]
  }))
}

for (const file of files) {
  const path = join(root, file)
  try {
    const source = await readFile(path, 'utf8')
    const data = sanitize(JSON.parse(source))
    const output = `${JSON.stringify(data, null, 2)}\n`
    await writeFile(path, output, 'utf8')
    console.log(`sanitized ${file}`)
  } catch (error) {
    console.warn(`skipped ${file}: ${error.message}`)
  }
}
