import { constants } from 'fs';
import { access, appendFile, mkdir, readFile } from 'fs/promises'
import path from 'path';

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

  static async saveFile(member, document, file) {
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

  static async getFile(path) {
    try {
      const file = await readFile(path)
      return file;
    }
    catch (err) {
      console.log(`could not retrieve file: ${err}`)
      return null;
    }
  }
}