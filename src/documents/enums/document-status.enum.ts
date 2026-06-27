import { registerEnumType } from '@nestjs/graphql';

export enum DocumentStatus {
  PENDIENTE = 'pendiente',
  NO_ACEPTADO = 'no_aceptado',
  ACEPTADO = 'aceptado',
}

registerEnumType(DocumentStatus, {
  name: 'DocumentStatus',
  description: 'Current status of a citizenship document.',
  valuesMap: {
    PENDIENTE: { description: 'Pending — document not yet submitted or under review.' },
    NO_ACEPTADO: { description: 'Not accepted — document was rejected or requires correction.' },
    ACEPTADO: { description: 'Accepted — document has been approved.' },
  },
});
