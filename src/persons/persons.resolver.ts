import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { PersonsService } from './persons.service';
import { Person } from './entities/person.schema';
import { CreatePersonInput } from './dto/create-person.input';
import { UpdatePersonInput } from './dto/update-person.input';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../auth/entities/user.schema';

@Resolver(() => Person)
@UseGuards(GqlAuthGuard)
export class PersonsResolver {
  constructor(private readonly personsService: PersonsService) {}

  @Mutation(() => Person)
  createPerson(
    @Args('input') input: CreatePersonInput,
    @CurrentUser() user: UserDocument,
  ) {
    return this.personsService.create(input, user._id.toString());
  }

  @Query(() => [Person], { name: 'personsByFamily' })
  findByFamily(
    @Args('familyId', { type: () => ID }) familyId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.personsService.findByFamily(familyId, user._id.toString());
  }

  @Query(() => Person, { name: 'person' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.personsService.findOne(id, user._id.toString());
  }

  @Mutation(() => Person)
  updatePerson(
    @Args('input') input: UpdatePersonInput,
    @CurrentUser() user: UserDocument,
  ) {
    return this.personsService.update(input, user._id.toString());
  }

  @Mutation(() => ID)
  removePerson(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.personsService.remove(id, user._id.toString());
  }
}
