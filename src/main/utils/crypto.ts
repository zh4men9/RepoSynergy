import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const ENCODING = 'hex' as const;
const KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key'; // 在生产环境中使用环境变量

/**
 * 加密数据
 * @param text 要加密的文本
 * @returns 加密后的文本
 */
export function encrypt(text: string): string {
  try {
    const iv = randomBytes(IV_LENGTH);
    const salt = randomBytes(SALT_LENGTH);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
    
    let encrypted = cipher.update(text, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);
    
    const tag = cipher.getAuthTag();
    
    // 将 iv、salt 和 tag 与加密数据一起存储
    return Buffer.concat([
      salt,
      iv,
      Buffer.from(encrypted, ENCODING),
      tag
    ]).toString(ENCODING);
  } catch (error) {
    console.error('加密失败:', error);
    throw new Error('加密失败');
  }
}

/**
 * 解密数据
 * @param encrypted 加密的文本
 * @returns 解密后的文本
 */
export function decrypt(encrypted: string): string {
  try {
    const buf = Buffer.from(encrypted, ENCODING);
    
    const salt = buf.subarray(0, SALT_LENGTH);
    const iv = buf.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buf.subarray(buf.length - TAG_LENGTH);
    const text = buf.subarray(SALT_LENGTH + IV_LENGTH, buf.length - TAG_LENGTH);
    
    const decipher = createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(text.toString(ENCODING), ENCODING, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('解密失败:', error);
    throw new Error('解密失败');
  }
} 