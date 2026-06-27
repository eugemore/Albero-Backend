import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { FamiliesService } from './families.service';
import { Family } from './entities/family.schema';
import { CreateFamilyInput } from './dto/create-family.input';
import { UpdateFamilyInput } from './dto/update-family.input';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from '../auth/entities/user.schema';

@Resolver(() => Family)
@UseGuards(GqlAuthGuard)
export class FamiliesResolver {
  constructor(private readonly familiesService: FamiliesService) {}

  @Mutation(() => Family)
  createFamily(
    @Args('input') input: CreateFamilyInput,
    @CurrentUser() user: UserDocument,
  ) {
    return this.familiesService.create(input, user._id.toString());
  }

  @Query(() => [Family], { name: 'families' })
  findAll(@CurrentUser() user: UserDocument) {
    return this.familiesService.findAll(user._id.toString());
  }

  @Query(() => Family, { name: 'family' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.familiesService.findOne(id, user._id.toString());
  }

  @Mutation(() => Family)
  updateFamily(
    @Args('input') input: UpdateFamilyInput,
    @CurrentUser() user: UserDocument,
  ) {
    return this.familiesService.update(input, user._id.toString());
  }

  @Mutation(() => ID)
  removeFamily(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.familiesService.remove(id, user._id.toString());
  }
}
