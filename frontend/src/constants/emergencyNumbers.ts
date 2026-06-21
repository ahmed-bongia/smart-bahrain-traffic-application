export interface NationalEmergencyNumber {
  id: string;
  name: string;
  number: string;
  icon: string;
}

export const NATIONAL_EMERGENCY_NUMBERS: NationalEmergencyNumber[] = [
  {
    id: 'police',
    name: 'Police',
    number: '999',
    icon: 'shield-outline',
  },
  {
    id: 'ambulance',
    name: 'Ambulance',
    number: '999',
    icon: 'medical',
  },
  {
    id: 'fire',
    name: 'Fire Brigade',
    number: '999',
    icon: 'flame',
  },
  {
    id: 'civil_defense',
    name: 'Civil Defense',
    number: '999',
    icon: 'alert-circle-outline',
  },
];
