module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
        '^@entities/(.*)$': '<rootDir>/src/entities/$1',
        '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
        '^@dtos/(.*)$': '<rootDir>/src/dtos/$1',
        '^@services/(.*)$': '<rootDir>/src/services/$1',
        '^@routes/(.*)$': '<rootDir>/src/routes/$1'
    },
    moduleDirectories: ['node_modules', 'src'],
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    transform: {
        '^.+\\.(t|j)s$': [
            'ts-jest',
            {
                isolatedModules: false,
                tsconfig: 'tsconfig.json' //Asegura que Jest use tu tsconfig
            }
        ]
    },
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.test\\.ts$',
    collectCoverageFrom: ['**/*.(t|j)s'],
    coverageDirectory: '../coverage'
};
