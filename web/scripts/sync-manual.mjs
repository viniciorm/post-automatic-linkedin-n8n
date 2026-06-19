import { copyFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const source = fileURLToPath(new URL('../../docs/MANUAL_AUTOMATIZACION_LINKEDIN_N8N.md', import.meta.url))
const destination = fileURLToPath(new URL('../src/content/manual.md', import.meta.url))

await mkdir(dirname(destination), { recursive: true })
await copyFile(source, destination)
console.log(`Manual sincronizado desde ${source}`)
