import mongodb from 'mongodb';
import dotenv from 'dotenv';
import DocumentsDAO from './DAOs/documents.dao.js'
import app from './app.js'
import FileManager from './services/file-manager.service.js';


dotenv.config();

const MongoClient = mongodb.MongoClient
const port = process.env.DOCUMENTS_PORT || 8000;

MongoClient.connect(process.env.ALBERO_DB_URI,
  {
    maxPoolSize: 50,
    waitQueueTimeoutMS: 2500,
    // useNewUrlParse: true
  }).catch(err => {
    console.error(err.stack);
    process.exit(1);
  }).then(async client => {
    await DocumentsDAO.injectDB(client);
    await FileManager.connectBucket();
    app.listen(port, () => {
      console.log(`listening to port ${port}`);
    })
  })