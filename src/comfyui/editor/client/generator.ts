type GenerateItem = [string, number] | [string];

const pattern = /\{([^{}]*)\}/g;

function p(item: GenerateItem) {
  return item[1] ?? 1;
}

/**
 * 一个小工具，用模板生成提示词。
 * @param text 模板
 * @param json 模板Json
 * @param depth 递归深度
 * @returns 生成提示词
 */
export function generatePrompt(
  text: string,
  json: Record<string, GenerateItem[]>,
  depth: number = 0,
): string {
  if (depth > 100) return text;

  return text.replace(pattern, (_, body: string) => {
    // {key:probility}
    const [key, probability] = body.split(':');

    if (probability) {
      if (Math.random() >= parseFloat(probability)) return '';
    }

    const items = json[key];
    if (!items?.length) return `{${body}}`;

    const total = items.reduce((s, c) => s + p(c), 0);

    let roll = Math.random() * total;
    let item = items.at(-1)!;
    for (const i of items) {
      roll -= p(i);
      if (roll < 0) {
        item = i;
        break;
      }
    }
    return generatePrompt(item[0], json, depth + 1);
  });
}
