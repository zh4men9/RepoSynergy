import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// 加密配置
const ALGORITHM = process.env.VITE_ENCRYPTION_ALGORITHM || 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const ENCODING = 'hex' as const;

// 从环境变量获取加密密钥，如果未设置则使用随机生成的密钥
const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY || randomBytes(32).toString('hex');

/**
 * 加密数据
 * @param text 要加密的文本
 * @returns 加密后的文本（格式：salt:iv:加密数据:tag）
 */
export function encrypt(text: string): string {
  try {
    // 生成随机盐和IV
    const salt = randomBytes(SALT_LENGTH);
    const iv = randomBytes(IV_LENGTH);

    // 使用盐和密钥生成密钥
    const key = scryptSync(ENCRYPTION_KEY, salt, 32);

    // 创建加密器
    const cipher = createCipheriv(ALGORITHM, key, iv);

    // 加密数据
    let encrypted = cipher.update(text, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    // 获取认证标签
    const tag = cipher.getAuthTag();

    // 组合加密结果
    return [
      salt.toString(ENCODING),
      iv.toString(ENCODING),
      encrypted,
      tag.toString(ENCODING),
    ].join(':');
  } catch (error) {
    console.error('加密失败:', error);
    throw new Error('加密失败');
  }
}

/**
 * 解密数据
 * @param encryptedText 加密的文本（格式：salt:iv:加密数据:tag）
 * @returns 解密后的文本
 */
export function decrypt(encryptedText: string): string {
  try {
    // 分解加密文本
    const [salt, iv, encrypted, tag] = encryptedText.split(':').map(part => Buffer.from(part, ENCODING));

    // 使用盐和密钥生成密钥
    const key = scryptSync(ENCRYPTION_KEY, salt, 32);

    // 创建解密器
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // 解密数据
    let decrypted = decipher.update(encrypted, ENCODING, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('解密失败:', error);
    throw new Error('解密失败');
  }
} 