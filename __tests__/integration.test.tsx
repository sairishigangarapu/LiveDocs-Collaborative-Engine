import { describe, it, expect, jest } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import NewDocumentButton from '../components/NewDocumentButton';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}));

// Mock the createNewDocument action
jest.mock('../actions/actions', () => ({
  createNewDocument: jest.fn()
}));

import { createNewDocument } from '../actions/actions';

const mockPush = jest.fn();
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockCreateNewDocument = createNewDocument as jest.MockedFunction<typeof createNewDocument>;

describe('NewDocumentButton Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn()
    });
  });

  it('should show loading state and navigate on success', async () => {
    mockCreateNewDocument.mockResolvedValue({
      success: true,
      docID: 'test-doc-id'
    });

    render(<NewDocumentButton />);
    
    const button = screen.getByRole('button', { name: /new document/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Creating...')).toBeInTheDocument();
    });

    // Should navigate to document page
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/doc/test-doc-id');
    });
  });

  it('should display error message on failure', async () => {
    mockCreateNewDocument.mockResolvedValue({
      success: false,
      error: 'Database connection error. Please try again later.'
    });

    render(<NewDocumentButton />);
    
    const button = screen.getByRole('button', { name: /new document/i });
    fireEvent.click(button);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText('Database connection error. Please try again later.')).toBeInTheDocument();
    });

    // Should show retry button
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('should allow retry after error', async () => {
    // First call fails
    mockCreateNewDocument.mockResolvedValueOnce({
      success: false,
      error: 'Network error. Please check your connection and try again.'
    });

    // Second call succeeds
    mockCreateNewDocument.mockResolvedValueOnce({
      success: true,
      docID: 'retry-doc-id'
    });

    render(<NewDocumentButton />);
    
    const button = screen.getByRole('button', { name: /new document/i });
    fireEvent.click(button);

    // Wait for error to appear
    await waitFor(() => {
      expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument();
    });

    // Click retry
    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    // Should navigate on successful retry
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/doc/retry-doc-id');
    });
  });
});