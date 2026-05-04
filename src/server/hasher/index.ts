/**
 * 参数接口，定义了加密/解密过程中使用的各种参数
 */
interface Parameter {
    readonly k: number;      // 基于密钥计算的值
    readonly s: number;      // 基于盐值计算的值
    readonly m: number;      // 用于奇偶匹配的模数
    readonly sk: number;     // 组合后的偏移量
    readonly count: number;  // 每次操作处理的字符数量
}

/**
 * 一个简单的加密，解密工具
 * 密码哈希器/加密解密器
 *
 * 该类实现了一种基于字符容器、盐值和密钥的加密解密算法。
 * 算法通过字符位置映射、奇偶匹配和随机插入等方式实现加密，
 * 并使用反向过程进行解密。
 */
export class Hasher {
    /**
     * 构造函数
     * @param container - 字符容器，包含所有可用的字符集（用作编码表）
     * @param salt - 盐值数组，用于增加加密的随机性
     * @param keys - 密钥数组，用于控制加密参数
     */
    constructor(
        private readonly container: string,
        private readonly salt: number[],
        private readonly keys: number[]
    ) {
    }

    /**
     * 根据索引获取加密参数
     * @param index - 索引值（用于从 keys 和 salt 中选择）
     * @returns 计算得到的参数对象
     *
     * 参数计算规则：
     * - k: 基于密钥值 + 1
     * - s: 基于盐值 + 1
     * - sk: k + s * 10（组合偏移）
     * - m: |k - s| + 2（奇偶判断模数）
     * - count: sk % 3 + 3（处理字符数，范围 3-5）
     */
    private getParameter(index: number): Parameter {
        // 从 keys 和 salt 中循环取值，并确保为正数（+1）
        const k = this.keys[index % this.keys.length] + 1;
        const s = this.salt[index % this.salt.length] + 1;

        // 计算组合偏移量
        const sk = k + s * 10;

        return {
            k: k,
            s: s,
            m: Math.abs(k - s) + 2,  // 确保 m >= 2
            sk: sk,
            count: sk % 3 + 3         // 结果为 3, 4 或 5
        };
    }

    /**
     * 判断两个位置的奇偶匹配关系
     * @param p - 参数对象
     * @param i - 位置1
     * @param j - 位置2
     * @returns 是否匹配（取模2后的值相等）
     *
     * 匹配条件：(i % p.m) % 2 === (j % p.m) % 2
     * 即两个位置在模 p.m 后，奇偶性相同
     */
    private fit(p: Parameter, i: number, j: number): boolean {
        return (i % p.m) % 2 === (j % p.m) % 2;
    }

    /**
     * 判断两个字符的匹配关系（字符版本）
     * @param p - 参数对象
     * @param i - 字符1
     * @param j - 字符2
     * @returns 两个字符在容器中的位置是否匹配
     */
    private fitWithChars(p: Parameter, i: string, j: string): boolean {
        return this.fit(p, this.container.indexOf(i), this.container.indexOf(j));
    }

    /**
     * 解密方法
     * @param ciphertext - 密文字符串
     * @returns 解密后的明文字符串
     *
     * 解密原理：
     * 1. 按步长（p.count）分段处理密文
     * 2. 在每一段中，根据匹配规则确定有效的目标字符
     * 3. 通过减去偏移量（p.sk）还原原始字符在容器中的位置
     * 4. 将位置映射回实际字符
     */
    public decrypt(ciphertext: string): string {
        const result: string[] = [];

        // i: 当前处理位置, step: 步数计数器
        for (let i = 0, step = 0; i < ciphertext.length; step++) {
            const p = this.getParameter(step);  // 获取当前步数的参数
            let currentChar = ciphertext[i];    // 当前段起始字符
            let found = false;                   // 是否在段内找到匹配

            // 遍历段内的每个字符（从第2个开始到 p.count）
            for (let j = 1; j < p.count; j++) {
                const nextChar = ciphertext[i + j];

                if (this.fitWithChars(p, currentChar, nextChar)) {
                    // 如果匹配，继续往后找
                    currentChar = nextChar;
                    found = true;
                } else {
                    // 不匹配时，根据是否找到过匹配来决定当前字符
                    currentChar = found
                        ? nextChar  // 如果之前有匹配，使用当前不匹配的字符
                        : this.fitWithChars(p, nextChar, ciphertext[i + j + 1])
                            ? currentChar  // 如果下一个匹配，保持当前字符
                            : nextChar;    // 否则使用下一个字符
                    break;
                }
            }

            // 计算原始字符在容器中的位置
            let idx = (this.container.indexOf(currentChar) - p.sk) % this.container.length;
            if (idx < 0) idx += this.container.length;  // 处理负数取模

            // 将解密出的字符添加到结果中
            result.push(this.container[idx]);
            i += p.count;  // 移动到下一段的开始位置
        }

        return result.join('');
    }

    /**
     * 加密方法
     * @param plaintext - 明文字符串
     * @returns 加密后的密文字符串
     * @throws 如果明文字符不在容器中则抛出错误
     *
     * 加密原理：
     * 1. 对明文中的每个字符单独处理
     * 2. 在容器中找到字符位置，加上偏移量（p.sk）得到新位置
     * 3. 生成 p.count-1 个额外的干扰字符
     * 4. 将正确字符和干扰字符随机排列，形成密文段
     *
     * 干扰字符选择规则：
     * - 只选择与正确字符不匹配的字符（通过 fit 函数判断）
     * - 随机决定插入到序列的开头或结尾
     */
    public encrypt(plaintext: string): string {
        const result: string[] = [];

        // 遍历明文中的每个字符
        for (let i = 0; i < plaintext.length; i++) {
            const plainChar = plaintext[i];
            const originalId = this.container.indexOf(plainChar);

            // 验证字符是否在容器中
            if (originalId === -1) {
                throw new Error(`Character '${plainChar}' not found in container`);
            }

            const p = this.getParameter(i);

            // 计算加密后的位置（加上偏移）
            const currentId = (originalId + p.sk) % this.container.length;

            // 收集所有与正确字符不匹配的字符索引
            // 这些将作为干扰项
            const cache = Array.from(
                {length: this.container.length},
                (_, j) => j
            ).filter(j => !this.fit(p, currentId, j));

            // 存储最终要输出的字符索引列表
            const indices: number[] = [currentId];

            // 生成 p.count-1 个干扰字符
            for (let j = 1; j < p.count; j++) {
                // 随机选择一个干扰字符
                const randomId = Math.floor(Math.random() * cache.length);
                const [cid] = cache.splice(randomId, 1);

                // 随机决定插入到开头还是结尾，增加加密随机性
                if (Math.random() > 0.5) {
                    indices.unshift(cid);  // 插入到开头
                } else {
                    indices.push(cid);      // 插入到结尾
                }
            }

            // 将索引转换为字符并添加到结果
            result.push(...indices.map(idx => this.container[idx]));
        }

        return result.join('');
    }
}