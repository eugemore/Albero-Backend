import { Logger, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { FamiliesModule } from './families/families.module';
import { PersonsModule } from './persons/persons.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        connectionFactory: (connection: Connection) => {
          const logger = new Logger('MongooseConnection');
          connection.on('connected', () => logger.log('MongoDB connected'));
          connection.on('error', (err: Error) => logger.error('MongoDB connection error', err.stack));
          connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
          return connection;
        },
      }),
      inject: [ConfigService],
    }),

    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req }) => ({ req }),
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
    }),

    AuthModule,
    FamiliesModule,
    PersonsModule,
    DocumentsModule,
  ],
})
export class AppModule {}
