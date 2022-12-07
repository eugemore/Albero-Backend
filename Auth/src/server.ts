import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import AuthDAL from './authorization/auth.dal'
import app from './app'


dotenv.config();


const port = process.env.AUTH_PORT || 8000;

MongoClient.connect(process.env.ALBERO_DB_URI,
  {
    maxPoolSize: 50,
    waitQueueTimeoutMS: 2500,
    // useNewUrlParse: true
  }).catch(err => {
    console.error(err.stack);
    process.exit(1);
  }).then(async client => {
    AuthDAL.injectDB(client);
    app.listen(port, () => {
      console.log(`listening to port ${port}`);
    })
  })