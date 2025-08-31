import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock the Firebase admin and Clerk auth
jest.mock('@/firebase-admin', () => ({
  adminDB: {
    collection: jest.fn(() => ({
      add: jest.fn(() => Promise.resolve({ id: 'test-doc-id' })),
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            set: jest.fn(() => Promise.resolve())
          }))
        }))
      }))
    }))
  }
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}));

import { createNewDocument } from '../actions/actions';
import { auth } from '@clerk/nextjs/server';

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('Document Creation Workflow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create document successfully with valid user', async () => {
    // Mock authenticated user
    mockAuth.mockResolvedValue({
      userId: 'test-user-id',
      sessionClaims: { email: 'test@example.com' }
    });

    const result = await createNewDocument();

    expect(result.success).toBe(true);
    expect(result.docID).toBe('test-doc-id');
    expect(result.error).toBeUndefined();
  });

  it('should handle unauthenticated user', async () => {
    // Mock unauthenticated user
    mockAuth.mockResolvedValue({
      userId: null,
      sessionClaims: null
    });

    const result = await createNewDocument();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Please sign in to create a document');
    expect(result.docID).toBeUndefined();
  });

  it('should handle Firebase errors gracefully', async () => {
    // Mock authenticated user
    mockAuth.mockResolvedValue({
      userId: 'test-user-id',
      sessionClaims: { email: 'test@example.com' }
    });

    // Mock Firebase error
    const { adminDB } = require('@/firebase-admin');
    adminDB.collection.mockReturnValue({
      add: jest.fn(() => Promise.reject(new Error('PERMISSION_DENIED: Missing or insufficient permissions')))
    });

    const result = await createNewDocument();

    expect(result.success).toBe(false);
    expect(result.error).toBe("You don't have permission to create documents.");
    expect(result.docID).toBeUndefined();
  });
});