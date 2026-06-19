const content = String(
  $json.choices?.[0]?.message?.content ?? ''
).trim();

const extractJsonObject = (text) => {
  const start = text.indexOf('{');

  if (start === -1) {
    throw new Error('La respuesta de Groq no contiene un objeto JSON.');
  }

  let output = '';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index++) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        output += char;
        escaped = false;
        continue;
      }

      if (char === '\\') {
        output += char;
        escaped = true;
        continue;
      }

      if (char === '"') {
        output += char;
        inString = false;
        continue;
      }

      if (char === '\n') {
        output += '\\n';
      } else if (char === '\r') {
        output += '\\r';
      } else if (char === '\t') {
        output += '\\t';
      } else if (char.charCodeAt(0) < 32) {
        output += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
      } else {
        output += char;
      }

      continue;
    }

    output += char;

    if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth++;
    } else if (char === '}') {
      depth--;

      if (depth === 0) {
        return output;
      }
    }
  }

  throw new Error('Groq devolvió un objeto JSON incompleto.');
};

let parsed;

try {
  parsed = JSON.parse(extractJsonObject(content));
} catch (error) {
  throw new Error(`No fue posible interpretar la respuesta de Groq: ${error.message}`);
}

if (!parsed || typeof parsed !== 'object') {
  throw new Error('La respuesta procesada no es un objeto.');
}

if (typeof parsed.copy !== 'string' || !parsed.copy.trim()) {
  throw new Error('La respuesta de Groq no contiene un copy válido.');
}

const formatForLinkedIn = (value) => {
  const source = String(value ?? '').replace(/\r\n/g, '\n').trim();
  if (!source) return '';

  const result = [];
  const sourceParagraphs = source
    .split(/\n\s*\n/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  for (const paragraph of sourceParagraphs) {
    if (/^(?:#\S+\s*)+$/.test(paragraph)) {
      result.push(paragraph);
      continue;
    }

    const sentences = paragraph
      .match(/.*?(?:[.!?]+(?=\s|$)|$)/g)
      ?.map((sentence) => sentence.trim())
      .filter(Boolean) ?? [paragraph];

    let group = [];

    const flush = () => {
      if (group.length) result.push(group.join(' '));
      group = [];
    };

    for (const sentence of sentences) {
      const isQuestion = sentence.startsWith('¿');
      const nextLength = [...group, sentence].join(' ').length;

      if (isQuestion) {
        flush();
        result.push(sentence);
      } else {
        if (group.length >= 2 || nextLength > 220) flush();
        group.push(sentence);
      }
    }

    flush();
  }

  return result.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
};

return [{
  json: {
    copy: formatForLinkedIn(parsed.copy),
    visual_prompt: String(parsed.visual_prompt ?? '').trim(),
  },
}];
