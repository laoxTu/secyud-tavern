interface Parameter {
    readonly k: number;
    readonly s: number;
    readonly m: number;
    readonly sk: number;
    readonly count: number;
}

export class Hasher {
    constructor(
        private readonly container: string,
        private readonly salt: number[],
        private readonly keys: number[]
    ) {
    }

    private getParameter(index: number): Parameter {
        const k = this.keys[index % this.keys.length] + 1;
        const s = this.salt[index % this.salt.length] + 1;
        const sk = k + s * 10;

        return {
            k: k,
            s: s,
            m: Math.abs(k - s) + 2,
            sk: sk,
            count: sk % 3 + 3
        };
    }

    private fit(p: Parameter, i: number, j: number): boolean {
        return (i % p.m) % 2 === (j % p.m) % 2;
    }

    private fitWithChars(p: Parameter, i: string, j: string): boolean {
        return this.fit(p, this.container.indexOf(i), this.container.indexOf(j));
    }

    public decrypt(ciphertext: string): string {
        const result: string[] = [];

        for (let i = 0, step = 0; i < ciphertext.length; step++) {
            const p = this.getParameter(step);
            let currentChar = ciphertext[i];
            let found = false;

            for (let j = 1; j < p.count; j++) {
                const nextChar = ciphertext[i + j];

                if (this.fitWithChars(p, currentChar, nextChar)) {
                    currentChar = nextChar;
                    found = true;
                } else {
                    currentChar = found
                        ? nextChar
                        : this.fitWithChars(p, nextChar, ciphertext[i + j + 1])
                            ? currentChar
                            : nextChar;
                    break;
                }
            }

            let idx = (this.container.indexOf(currentChar) - p.sk) % this.container.length;
            if (idx < 0) idx += this.container.length;

            result.push(this.container[idx]);
            i += p.count;
        }

        return result.join('');
    }

    public encrypt(plaintext: string): string {
        const result: string[] = [];

        for (let i = 0; i < plaintext.length; i++) {
            const plainChar = plaintext[i];
            const originalId = this.container.indexOf(plainChar);

            if (originalId === -1) {
                throw new Error(`Character '${plainChar}' not found in container`);
            }

            const p = this.getParameter(i);
            const currentId = (originalId + p.sk) % this.container.length;

            // 收集不匹配的索引
            const cache = Array.from(
                {length: this.container.length},
                (_, j) => j
            ).filter(j => !this.fit(p, currentId, j));

            const indices: number[] = [currentId];

            for (let j = 1; j < p.count; j++) {
                const randomId = Math.floor(Math.random() * cache.length);
                const [cid] = cache.splice(randomId, 1);

                // 随机决定插入位置
                if (Math.random() > 0.5) {
                    indices.unshift(cid);
                } else {
                    indices.push(cid);
                }
            }

            result.push(...indices.map(idx => this.container[idx]));
        }

        return result.join('');
    }
}