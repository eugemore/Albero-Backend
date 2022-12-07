import { describe, expect, test, jest, beforeAll } from '@jest/globals';
import { MongoClient, Db,  } from "mongodb";
import AuthDAO from '../src/authorization/auth.dal';
import dotenv from 'dotenv';


dotenv.config();

describe('AuthDAO', () => {
  describe('Database Injection', () => {

    let connection: Partial<MongoClient>;
    let db: Partial<Db>;

    beforeAll(async () => {
      connection = {
        db: jest.fn((value) => db as Db)
      }
      db = {
        collection: jest.fn((value) => value)
      }
    })

    test('InjectDB, it works', async () => {
      //Arrange
      const spy = jest.spyOn(db, 'collection')

      //Act
      AuthDAO.injectDB(connection as MongoClient);

      //Assert
      expect(spy).toBeCalledWith('subjects')
      expect(spy).toBeCalledWith('Authorization')
    })

    test('InjectDB, it throws error', async () => {
      //Arrange
      db.collection = jest.fn((value) => { throw new Error })
      const spy = jest.spyOn(db, 'collection');

      //Act
      const result = AuthDAO.injectDB(connection as MongoClient);

      //Assert
      expect(spy).not.toBeCalled()
    })
  })

  // describe('getUserByEmail', () => {
  //   let connection: MongoClient;
  //   let connectionSpy;
  //   let db: Db;
  //   let dbSpy: MockInstance<any>;
  //   let auth: Collection<any>;
  //   let authSpy: any;
  //   let families: Collection<any>;
  //   let familiesSpy;

  //   const mockReturnCollection = (value: string) => {
  //     if (value === ' Authorization') return auth;
  //     else return families;
  //   }

  //   const mockInsertOne = async (value: any): Promise<any> => {
  //     return value
  //   }

  //   beforeAll(async () => {
  //     await MongoClient.connect(process.env.MONGO_URL as string, {}).then((conn) => {
  //       connection = conn
  //     });
  //     db = connection.db()
  //     families = db.collection("subjects");
  //     auth = db.collection("Authorization");
  //     connectionSpy = jest.spyOn(connection, 'db').mockImplementation(value => db);
  //     dbSpy = jest.spyOn(db, 'collection').mockImplementation(value => mockReturnCollection(value));
  //     authSpy = jest.spyOn(auth, 'insertOne').mockImplementation(async (value) => mockInsertOne(value))
  //   })

  //   afterAll(async () => {
  //     await connection.close()
  //   })

  //   test('getUserByEmail, it works', async () => {
  //     //Arrange
  //     // const spy = jest.spyOn(db, 'collection')
  //     authSpy = jest.spyOn(auth, 'findOne').mockImplementation(async (value) => mockInsertOne(value))

  //     const mockUser = {
  //       _id: new ObjectId(),
  //       email: 'test@test.com',
  //       password: '123',
  //       active: true
  //     };

  //     // const spy2 = jest.spyOn(db.collection('subjects'),'findOne')
  //     // spy2.mockResolvedValue(mockUser as never)
  //     //Act
  //     AuthDAO.injectDB(connection);
  //     // const retrievedUser = await db.collection('Authorization').findOne({'email':mockUser.email});
  //     const retrievedUser = await AuthDAO.getUserByEmail(mockUser.email);



  //     //Assert
  //     expect(dbSpy).toBeCalled();
  //     expect(authSpy).toBeCalled();
  //     // expect(true).toBe(true)
  //     // expect(retrievedUser).toEqual(mockUser);
  //     // expect(spy2).toBeCalled()
  //     // expect(connection.db).toBeCalled()
  //   });
  // });
});

