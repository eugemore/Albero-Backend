import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DocumentsResolver } from './documents.resolver';
import { DocumentsService } from './documents.service';
import { CiudadaniaDocument, DocumentSchema } from './entities/document.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CiudadaniaDocument.name, schema: DocumentSchema },
    ]),
  ],
  providers: [DocumentsResolver, DocumentsService],
})
export class DocumentsModule {}
