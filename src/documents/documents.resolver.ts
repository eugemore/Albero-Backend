import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { DocumentsService } from './documents.service';
import { CiudadaniaDocument } from './entities/document.schema';
import { CreateDocumentInput } from './dto/create-document.input';
import { UpdateDocumentInput } from './dto/update-document.input';
import { DocumentStatus } from './enums/document-status.enum';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../auth/entities/user.schema';

@Resolver(() => CiudadaniaDocument)
@UseGuards(GqlAuthGuard)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  @Mutation(() => CiudadaniaDocument)
  createDocument(
    @Args('input') input: CreateDocumentInput,
    @CurrentUser() user: UserDocument,
  ) {
    return this.documentsService.create(input, user._id.toString());
  }

  /** List all documents linked to a specific person. */
  @Query(() => [CiudadaniaDocument], { name: 'documentsByPerson' })
  findByPerson(
    @Args('personId', { type: () => ID }) personId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.documentsService.findByPerson(personId, user._id.toString());
  }

  /** List all documents filtered by status — useful for dashboard views. */
  @Query(() => [CiudadaniaDocument], { name: 'documentsByStatus' })
  findByStatus(
    @Args('status', { type: () => DocumentStatus }) status: DocumentStatus,
    @CurrentUser() user: UserDocument,
  ) {
    return this.documentsService.findByStatus(status, user._id.toString());
  }

  @Query(() => CiudadaniaDocument, { name: 'document' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.documentsService.findOne(id, user._id.toString());
  }

  @Mutation(() => CiudadaniaDocument)
  updateDocument(
    @Args('input') input: UpdateDocumentInput,
    @CurrentUser() user: UserDocument,
  ) {
    return this.documentsService.update(input, user._id.toString());
  }

  @Mutation(() => ID)
  removeDocument(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.documentsService.remove(id, user._id.toString());
  }
}
