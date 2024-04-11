import { PrismaClient } from '@taly-eir/taly-prisma';
import { mockDeep, mockReset } from 'vitest-mock-extended';
import { beforeEach } from 'vitest';

// Mock the PrismaClient
const mockPrisma = mockDeep<PrismaClient>();

// Reset the mock before each test
beforeEach(() => {
  mockReset(mockPrisma);
});

export default mockPrisma;
