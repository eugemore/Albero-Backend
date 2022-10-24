import mongodb from 'mongodb';
import dotenv from 'dotenv';
import FamilyDAO from './DAOs/family.dao.js'
import OptionsDAO from './DAOs/options.dao.js'
import app from './app.js'


dotenv.config();

const MongoClient = mongodb.MongoClient
const port = process.env.PORT || 8000;

MongoClient.connect(process.env.ALBERO_DB_URI,
  {
    maxPoolSize: 50,
    waitQueueTimeoutMS: 2500,
    // useNewUrlParse: true
  }).catch(err => {
    console.error(err.stack);
    process.exit(1);
  }).then(async client => {
    await FamilyDAO.injectDB(client);
    await OptionsDAO.injectDB(client);
    // await ReviewsDAO.injectDB(client);
    app.listen(port, () => {
      console.log(`listening to port ${port}`);
    })
  })