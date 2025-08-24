import * as crypto from 'crypto';

export const encryptMnemonic = (mnemonic: string, password: string): string => {
  if (!mnemonic || !password) {
    return null;
  }

  const algorithm = 'aes-256-ctr';
  const iv = crypto.randomBytes(16);
  const key = crypto.createHash('sha256').update(password).digest();

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(mnemonic), cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

export const decryptMnemonic = (
  encryptedData: any,
  password: string,
): string => {
  if (!encryptedData || !password) {
    return null;
  }

  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = Buffer.from(parts[1], 'hex');
  const key = crypto.createHash('sha256').update(password).digest();

  const decipher = crypto.createDecipheriv('aes-256-ctr', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString();
};
