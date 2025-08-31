/**
 * Basic tests for the createNewDocument action
 * These tests verify the enhanced error handling and response structure
 */

import { createNewDocument } from '../actions/actions';

// Mock the dependencies
jest.mock('@/firebase-admin', () => ({
  adminDB: {
    collection: jest.fn(() => ({
      add: jest.fn(),
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            set: jest.fn()
          }))
        }))
      }))
    }))
  }
}));

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn()
}));

describe('createNewDocument', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return error when user is not authenticated', async () => {
    const { auth } = require('@clerk/nextjs/server');
    auth.mockResolvedValue({ userId: null, sessionClaims: null });

    const result = await createNewDocument();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Please sign in to create a document');
    expect(result.docID).toBeUndefined();
  });

  it('should return error when user email is missing', async () => {
    const { auth } = require('@clerk/nextjs/server');
    auth.mockResolvedValue({ userId: 'user123', sessionClaims: {} });

    const result = await createNewDocument();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Please sign in to create a document');
    expect(result.docID).toBeUndefined();
  });

  it('should successfully create document when user is authenticated', async () => {
    const { auth } = require('@clerk/nextjs/server');
    const { adminDB } = require('@/firebase-admin');
    
    auth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: { email: 'test@example.com' }
    });

    const mockDocRef = { id: 'doc123' };
    adminDB.collection().add.mockResolvedValue(mockDocRef);
    adminDB.collection().doc().collection().doc().set.mockResolvedValue({});

    const result = await createNewDocument();

    expect(result.success).toBe(true);
    expect(result.docID).toBe('doc123');
    expect(result.error).toBeUndefined();
  });

  it('should handle Firebase errors gracefully', async () => {
    const { auth } = require('@clerk/nextjs/server');
    const { adminDB } = require('@/firebase-admin');
    
    auth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: { email: 'test@example.com' }
    });

    adminDB.collection().add.mockRejectedValue(new Error('Firebase connection failed'));

    const result = await createNewDocument();

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database connection error. Please try again later.');
    expect(result.docID).toBeUndefined();
  });

  it('should handle permission errors specifically', async () => {
    const { auth } = require('@clerk/nextjs/server');
    const { adminDB } = require('@/firebase-admin');
    
    auth.mockResolvedValue({
      userId: 'user123',
      sessionClaims: { email: 'test@example.com' }
    });

    adminDB.collection().add.mockRejectedValue(new Error('permission denied'));

    const result = await createNewDocument();

    expect(result.success).toBe(false);
    expect(result.error).toBe("You don't have permission to create documents.");
    expect(result.docID).toBeUndefined();
  });
});