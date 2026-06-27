import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FamiliesResolver } from './families.resolver';
import { FamiliesService } from './families.service';
import { Family, FamilySchema } from './entities/family.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Family.name, schema: FamilySchema }]),
  ],
  providers: [FamiliesResolver, FamiliesService],
  exports: [FamiliesService],
})
export class FamiliesModule {}
