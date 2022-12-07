import Owner from './owner.model';
import FamilyMember from './member.model';

export interface Family {
  createdAt: Date,
  owner: Owner,
  members: FamilyMember[]
}