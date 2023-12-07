import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export class Utils {
  static isValidURL = (str) => {
    if (!str) return false;

    const pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  };

  public static generateAppKey = (
    prefix = '',
    format: BufferEncoding = 'hex',
  ) => {
    return prefix + randomBytes(8).toString(format) + uuidv4();
  };
}
