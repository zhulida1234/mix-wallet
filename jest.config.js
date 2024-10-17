module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/test/fixtures'],
    coveragePathIgnorePatterns: ['<rootDir>/test/'],
    testRegex: 'test/(.+)\\.test\\.(jsx?|tsx?)$',
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/src/$1', // 将 @ 映射到 src 目录
    }
  };