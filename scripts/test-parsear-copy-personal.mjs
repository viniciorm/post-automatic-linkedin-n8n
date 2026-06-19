import { readFile } from 'node:fs/promises'

const code = await readFile(new URL('./nodes/parsear-copy-personal.js', import.meta.url), 'utf8')
const runNode = new Function('$json', code)

const cases = [
  {
    name: 'JSON con saltos literales y texto posterior',
    content: '```json\n{"copy":"Primer párrafo.\n\nSegundo párrafo.","visual_prompt":"Editorial image"}\n```\nExplicación adicional.',
  },
  {
    name: 'JSON válido',
    content: '{"copy":"Una frase. Otra frase.\\n\\n#n8n #LinkedIn","visual_prompt":"Clean technology editorial image"}',
  },
]

for (const testCase of cases) {
  const result = runNode({
    choices: [{ message: { content: testCase.content } }],
  })

  const output = result?.[0]?.json
  if (!output?.copy || !output?.visual_prompt) {
    throw new Error(`${testCase.name}: salida incompleta`)
  }

  console.log(`OK ${testCase.name}`)
}
