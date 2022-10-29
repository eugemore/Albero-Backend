import mongodb, { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import FamilyDAO from './DAOs/family.dao'
import OptionsDAO from './DAOs/options.dao'
import app from './app'


dotenv.config();

const port = process.env.FAMILY_PORT || 8000;
const mongoClient: MongoClient = new MongoClient(process.env.ALBERO_DB_URI || '',{
  maxPoolSize: 50,
  waitQueueTimeoutMS: 2500,
  // useNewUrlParse: true
})

mongoClient.connect().catch(err => {
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