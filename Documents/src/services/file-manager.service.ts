import { constants } from 'fs';
import { access, appendFile, mkdir, readFile } from 'fs/promises'

export default class FileManager {

  static async connectBucket() {
    try {
      await access('./BucketMock', constants.F_OK);
      console.log('Directory ./BucketMock exists')
    } catch (err) {
      await mkdir('./BucketMock')
      console.log('Directory ./BucketMock Created')
    }
  }

  static async saveFile(member: string, document:{ type: string, subtype: string, documentURI?: string}, file: any): Promise<string | null> {
    try {
      const path = `./bucketMock/${document.type}_${document.subtype}_${member}.pdf`;
      await appendFile(path,file.data);
      return path;
    }
    catch (err) {
      console.log(`Could not save file: ${err}`)
      return null;
    }
  }

  static async getFile(fileURI: string): Promise<Buffer | null> {
    try {
      const file: Buffer = await readFile(fileURI)
      return file;
    }
    catch (err) {
      console.log(`could not retrieve file: ${err}`)
      return null;
    }
  }
}