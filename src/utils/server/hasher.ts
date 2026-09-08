import crypto from 'crypto';

/**
 * 一个简单的加密，解密工具
 */
function create(key: Buffer) {
  return {
    /**
     *
     * @param ciphertext 密文
     * @param iv 16位向量
     */
    decrypt(ciphertext: string, iv: Buffer): string {
      if (!ciphertext) return '';
      const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
      let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    },
    /**
     *
     * @param plaintext 明文
     * @param iv 16位向量
     */
    encrypt(plaintext: string, iv: Buffer): string {
      if (!plaintext) return '';
      const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
      let encrypted = cipher.update(plaintext, 'utf8', 'base64');
      encrypted += cipher.final('base64');
      return encrypted;
    },
  };
}

function generateKey(text: string, salt: string) {
  return crypto.pbkdf2Sync(text, salt, 100000, 16, 'sha256');
}

export const hasher = (() => {
  return {
    ...create(
      generateKey(
        process.env.SECRET_KEYS ?? 'secyud',
        process.env.SECRET_SALT ?? 'secyud',
      ),
    ),
    create,
    generateKey,
  };
})();
