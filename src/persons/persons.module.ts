import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PersonsResolver } from './persons.resolver';
import { PersonsService } from './persons.service';
import { Person, PersonSchema } from './entities/person.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Person.name, schema: PersonSchema }]),
  ],
  providers: [PersonsResolver, PersonsService],
  exports: [PersonsService],
})
export class PersonsModule {}
