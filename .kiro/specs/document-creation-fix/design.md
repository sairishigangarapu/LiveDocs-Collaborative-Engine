# Design Document

## Overview

This design addresses the document creation workflow issues by implementing proper Firebase configuration, creating the missing document route handler, establishing Firestore collections, and implementing comprehensive error handling. The solution ensures users can successfully create documents and navigate to them without encountering 404 errors or Firebase connection issues.

## Architecture

### Component Flow
```
User Click → NewDocumentButton → createNewDocument Action → Firebase Admin → Firestore → Route Navigation → Document Page
```

### Key Components
1. **Firebase Configuration Layer**: Proper environment setup and connection management
2. **Document Creation Service**: Server action handling document creation with error handling
3. **Route Handler**: Dynamic route for individual documents (`/doc/[docId]`)
4. **UI Components**: Enhanced button with loading states and error feedback

## Components and Interfaces

### 1. Firebase Configuration

**Service Account Configuration Options**
- Option 1: Use service account JSON file directly with proper file path configuration
- Option 2: Fix environment variable approach with proper private key encoding
- Validate service account credentials can be properly decoded by Firebase Admin SDK
- Implement fallback error handling for credential parsing issues

**Firebase Admin Configuration**
- Update `firebase-admin.ts` to handle service account JSON file or properly formatted environment variables
- Add comprehensive credential validation before initialization
- Implement specific error handling for decoder and credential parsing errors
- Ensure proper private key format handling (newlines, encoding, special characters)

### 2. Document Creation Action

**Enhanced Server Action** (`actions/actions.ts`)
```typescript
interface CreateDocumentResult {
  success: boolean;
  docID?: string;
  error?: string;
}

export async function createNewDocument(): Promise<CreateDocumentResult>
```

**Key Features:**
- Comprehensive error handling with try-catch blocks
- User authentication validation
- Firestore document creation with proper data structure
- User-document relationship management
- Detailed error logging for debugging

### 3. Document Route Handler

**Dynamic Route Structure**
- Create `/app/doc/[docId]/page.tsx` that redirects to a 404 page
- Simple placeholder implementation that acknowledges the route exists
- Handle document ID parameter but redirect to not-found page
- Prepare structure for future document page implementation

**Document Page Interface**
```typescript
interface DocumentPageProps {
  params: { docId: string };
}
```

**Implementation Approach**
- Create basic page component that imports `notFound()` from Next.js
- Call `notFound()` to trigger 404 page instead of displaying document content
- This prevents the current routing errors while maintaining the URL structure

### 4. Enhanced UI Components

**NewDocumentButton Improvements**
- Maintain existing loading state functionality
- Add error state display
- Implement retry mechanism on failures
- Provide user feedback for different error scenarios

## Data Models

### Document Model (Firestore)
```typescript
interface Document {
  owner: string;           // User ID from Clerk
  title: string;          // Document title
  createdAt: Timestamp;   // Creation timestamp
  updatedAt?: Timestamp;  // Last update timestamp
  content?: string;       // Document content (optional)
}
```

### User-Document Relationship Model
```typescript
interface UserRoom {
  userId: string;         // User email from Clerk
  role: 'owner' | 'editor' | 'viewer';
  createdAt: Timestamp;
  roomID: string;         // Document ID reference
}
```

### Firestore Collections Structure
```
/documents/{docId}
  - owner: string
  - title: string
  - createdAt: timestamp
  - updatedAt: timestamp
  - content: string

/users/{userEmail}/rooms/{docId}
  - userId: string
  - role: string
  - createdAt: timestamp
  - roomID: string
```

## Error Handling

### Firebase Connection Errors
- Validate environment variables on application startup
- Provide clear error messages for missing or invalid configuration
- Implement connection retry logic for transient failures
- Log detailed error information for debugging

### Document Creation Errors
- Handle authentication failures gracefully
- Manage Firestore write permission errors
- Provide user-friendly error messages
- Implement proper error state management in UI

### Navigation Errors
- Validate document IDs before navigation
- Handle non-existent document scenarios
- Provide fallback UI for invalid routes
- Implement proper loading states during navigation

### Error Response Structure
```typescript
interface ErrorResponse {
  success: false;
  error: string;          // User-friendly message
  code?: string;          // Error code for debugging
  details?: any;          // Additional error context
}
```

## Testing Strategy

### Unit Tests
- Test document creation action with various scenarios
- Validate Firebase configuration parsing
- Test error handling for different failure modes
- Verify user authentication validation

### Integration Tests
- Test complete document creation workflow
- Validate Firestore document structure
- Test navigation flow from button click to document page
- Verify user-document relationship creation

### Error Scenario Tests
- Test behavior with invalid Firebase configuration
- Validate handling of authentication failures
- Test network connectivity issues
- Verify graceful degradation for various error states

### Manual Testing Checklist
- Verify Firebase environment variables are properly configured
- Test document creation with authenticated user
- Confirm navigation to document route triggers 404 page (expected behavior)
- Validate error messages for various failure scenarios
- Test loading states and button behavior

## Implementation Considerations

### Security
- Ensure proper user authentication before document creation
- Validate user permissions for document access
- Sanitize user inputs and document data
- Implement proper Firestore security rules

### Performance
- Optimize Firestore queries for document retrieval
- Implement proper loading states to improve perceived performance
- Consider caching strategies for frequently accessed documents
- Minimize unnecessary re-renders in UI components

### Scalability
- Design document structure to support future features
- Consider pagination for user document lists
- Plan for collaborative editing capabilities
- Design flexible permission system for document sharing