# Document Creation Testing Checklist

## Manual Testing Steps

### Prerequisites
- [ ] Ensure you have valid Firebase service account credentials
- [ ] Update `.env.local` with real Firebase configuration values
- [ ] Ensure user is authenticated with Clerk

### Test Scenarios

#### 1. Successful Document Creation
- [ ] Click "New Document" button
- [ ] Verify button shows "Creating..." loading state
- [ ] Verify button is disabled during creation
- [ ] Verify navigation to `/doc/[docId]` route
- [ ] Verify 404 page is displayed (expected behavior)
- [ ] Check browser console for successful creation logs
- [ ] Verify document appears in Firebase console under "documents" collection
- [ ] Verify user-document relationship appears in "users/{email}/rooms" collection

#### 2. Error Handling - Unauthenticated User
- [ ] Sign out of the application
- [ ] Click "New Document" button
- [ ] Verify error message: "Please sign in to create a document"
- [ ] Verify no navigation occurs
- [ ] Verify button returns to normal state

#### 3. Error Handling - Invalid Firebase Configuration
- [ ] Temporarily set invalid Firebase credentials in `.env.local`
- [ ] Restart the application
- [ ] Click "New Document" button
- [ ] Verify appropriate error message is displayed
- [ ] Verify "Try Again" button appears
- [ ] Click "Try Again" to test retry functionality

#### 4. Error Handling - Network Issues
- [ ] Disconnect from internet or block Firebase domains
- [ ] Click "New Document" button
- [ ] Verify network error message is displayed
- [ ] Verify retry functionality works when connection is restored

#### 5. UI/UX Testing
- [ ] Verify loading states work correctly
- [ ] Verify error messages are user-friendly
- [ ] Verify error messages can be dismissed with "×" button
- [ ] Verify "Try Again" button works correctly
- [ ] Verify multiple clicks are prevented during loading
- [ ] Verify button returns to normal state after success/failure

### Expected Results

#### Firebase Collections Structure
After successful document creation, verify these collections exist:

```
/documents/{docId}
  - owner: string (user ID)
  - title: "New Doc"
  - createdAt: timestamp

/users/{userEmail}/rooms/{docId}
  - userId: string (user email)
  - role: "owner"
  - createdAt: timestamp
  - roomID: string (document ID)
```

#### Console Logs
Look for these success logs:
- "Creating document for user: {userId} ({userEmail})"
- "Document created with ID: {docId}"
- "User-document relationship created for: {userEmail}"

#### Error Logs
Look for appropriate error logs when things fail:
- Authentication errors
- Firebase connection errors
- Permission errors

## Automated Testing

Run the test suites:

```bash
# Run unit tests
npm test __tests__/document-creation.test.ts

# Run integration tests
npm test __tests__/integration.test.tsx
```

## Notes

- The document route `/doc/[docId]` intentionally shows a 404 page as placeholder
- This prevents routing errors while maintaining proper URL structure
- Future implementation will display actual document content
- Firebase collections are created automatically when first document is added
- No manual collection setup is required in Firebase console