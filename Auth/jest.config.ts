import type { Config } from 'jest';

export default async (): Promise<Config> => {
  return {
    transform: {'^.+\\.ts?$': 'ts-jest'},
    preset: '@shelf/jest-mongodb',
    // testEnvironment: 'node',
    verbose:true
  };
  // return {
  //   preset: 'ts-jest',
  //   testEnvironment: 'node',
  //   verbose:true
  // };
};