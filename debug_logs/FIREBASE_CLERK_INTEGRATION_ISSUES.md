# Firebase + Clerk Integration Issues & Solutions

## Overview
This document logs the authentication and data fetching issues encountered when integrating Firebase Firestore with Clerk authentication in a Next.js application, along with their solutions and root causes.

---

## Issue #1: Firebase Permissions Error

### Error Message
```
Runtime FirebaseError: Missing or insufficient permissions.
app\doc\[id]\page.tsx (22:10) @ DocumentWrapper
```

### Root Cause
- **Authentication Mismatch**: Application was using Clerk for authentication but trying to access Firebase Firestore directly from client-side
- **Client-side Firebase SDK**: Firebase client SDK doesn't know about Clerk authentication - it expects Firebase Auth
- **Security Rules**: Firestore security rules were likely configured for Firebase Auth, not Clerk

### Solution Applied
**Converted from Client-side to Server-side Data Fetching**:

1. **Created Server Actions** (`actions/actions.ts`):
   ```typescript
   export async function getDocument(docId: string): Promise<GetDocumentResult> {
       const { userId, sessionClaims } = await auth(); // Clerk auth
       // Use Firebase Admin SDK server-side
       const docRef = adminDB.collection("documents").doc(docId);
       const docSnap = await docRef.get();
       // Return serialized data
   }
   ```

2. **Updated Document Component**:
   ```typescript
   // BEFORE: Client-side Firebase hooks
   const [data, loading, error] = useDocumentData(doc(db, "documents", id));
   
   // AFTER: Server actions
   const result = await getDocument(id);
   ```

### Key Learning
- **Server-side operations** with Firebase Admin SDK work with Clerk authentication
- **Client-side Firebase SDK** requires Firebase Auth, not Clerk
- **Always validate authentication** server-side before database operations

---

## Issue #2: Next.js 15 Params Serialization Error

### Error Message
```
Error: Route "/doc/[id]" used `params.id`. `params` should be awaited before using its properties.
Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
```

### Root Cause
- **Next.js 15 Breaking Change**: `params` object is now asynchronous and must be awaited
- **Synchronous Access**: Code was trying to access `params.id` directly without awaiting

### Solution Applied
```typescript
// BEFORE
export default async function DocumentPage({ params }: DocumentPageProps) {
    return <DocumentWrapper id={params.id} />;
}

// AFTER
export default async function DocumentPage({ params }: DocumentPageProps) {
    const { id } = await params; // ✅ Await params first
    return <DocumentWrapper id={id} />;
}
```

### Key Learning
- **Next.js 15** requires awaiting `params` before accessing properties
- **Breaking changes** in framework updates require code updates
- **Always check migration guides** when upgrading frameworks

---

## Issue #3: Firestore Data Serialization Error

### Error Message
```
Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. 
Classes or null prototypes are not supported.
{owner: ..., title: "New Doc", createdAt: {_seconds: ..., _nanoseconds: 310000000}}
```

### Root Cause
- **Firestore Timestamps**: Firebase Admin SDK returns Firestore Timestamp objects (class instances)
- **Client-Server Boundary**: Next.js cannot serialize class instances between server and client components
- **Data Type Mismatch**: Client expects plain JavaScript objects, not Firestore-specific classes

### Solution Applied
**Created Data Conversion Function**:
```typescript

---

## Issue #4: Users Not Rendering in Dialog

### Error Message
No explicit error, but users were not being displayed in the ManageUsers dialog despite being present in the database.

### Root Cause
- **Firestore Query Issues**: The collectionGroup query for users with access to a document was not returning results
- **Missing Fallback Handling**: No fallback mechanism when Firestore data is unavailable
- **Conditional Rendering**: The component only showed users when the Firestore query returned results

### Solution Applied
**Added Fallback User Data and Improved Rendering Logic**:
```typescript
// Added fallback users array for when Firestore query fails
const fallbackUsers = [
  { userId: currentUserEmail, role: 'owner' }
];

// Updated rendering logic to use fallback data when needed
{(usersInRoom?.docs && usersInRoom.docs.length > 0) ? (
  // Use data from Firestore collection
  usersInRoom.docs.map((doc) => {
    // Render user from Firestore
  })
) : currentUserEmail ? (
  // Use fallback data when Firestore collection is empty
  fallbackUsers.map((userData, index) => {
    // Render fallback user
  })
) : (
  <p>No users with access yet.</p>
)}
```

### Key Learning
- **Always provide fallback data** when relying on external data sources
- **Add debugging code** to identify issues with data fetching
- **Handle empty states gracefully** in UI components
- **Consider edge cases** where expected data might be missing
function convertFirestoreData(data: any): any {
    // Handle Firestore Timestamps
    if (data && typeof data === 'object' && data.constructor.name === 'Timestamp') {
        return data.toDate(); // Convert to JavaScript Date
    }
    
    // Handle other Firestore types...
    // Recursively convert nested objects
    
    return data;
}

// Usage in server action
const plainData = convertFirestoreData(docData) as DocumentData;
```

### Key Learning
- **Firestore returns class instances** that cannot be serialized
- **Always convert** Firestore data to plain objects before returning from server actions
- **Handle all Firestore data types** (Timestamps, DocumentReferences, GeoPoints, etc.)

---

## Issue #4: Sidebar Not Showing Documents

### Error Message
```
ReferenceError: useCollection is not defined
at Sidebar (components\Sidebar.tsx:33:33)
```

### Root Cause
- **Client-side Firebase Hooks**: Sidebar was using `useCollection` from `react-firebase-hooks`
- **Authentication Issues**: Same Clerk vs Firebase Auth problem as Issue #1
- **Missing Import**: After refactoring, `useCollection` import was removed but still referenced in code

### Solution Applied
**Complete Sidebar Refactor**:

1. **Created getUserDocuments Server Action**:
   ```typescript
   export async function getUserDocuments(): Promise<GetUserDocumentsResult> {
       // Fetch from users/{email}/rooms collection
       // Get document titles from documents collection
       // Return serialized data
   }
   ```

2. **Updated Sidebar Component**:
   ```typescript
   // BEFORE: Client-side hooks
   const [data, loading, error] = useCollection(query(...));
   
   // AFTER: Server actions
   const result = await getUserDocuments();
   setDocuments(result.documents);
   ```

3. **Updated SidebarOption Component**:
   ```typescript
   // BEFORE: Client-side Firebase hooks
   const [data, loading, error] = useDocumentData(doc(db, "documents", id));
   
   // AFTER: Props-based
   function SidebarOption({ href, id, title }: SidebarOptionProps) {
       return <span>{title || "Untitled"}</span>;
   }
   ```

### Key Learning
- **Consistent Architecture**: All data fetching should use the same pattern (server actions)
- **Remove Dependencies**: When refactoring, ensure all old dependencies are removed
- **Real-time Updates**: Added auto-refresh mechanism for document list updates

---

## Issue #5: Authentication State Mismatch

### Problem Description
Console showed user as authenticated, but application showed as unauthenticated.

### Root Cause
- **Client-Server State Mismatch**: Clerk authentication state was available on client but Firebase operations were failing
- **Different Authentication Contexts**: Client-side vs Server-side authentication validation

### Solution Applied
**Unified Authentication Flow**:
```typescript
// All server actions now validate Clerk authentication
const { userId, sessionClaims } = await auth();

if (!userId || !sessionClaims?.email) {
    return { success: false, error: "Please sign in" };
}
```

### Key Learning
- **Server-side validation** is the source of truth for authentication
- **Client-side state** can be misleading if not properly synchronized
- **Always validate** authentication server-side before database operations

---

## Issue #6: Liveblocks Authorization 403 from `/auth-endpoint`

### Error Message
```
POST /auth-endpoint 403
{"message":"You are not in this room"}
```

### Root Cause
- **Membership Check Path Mismatch**: The server checked membership with a collection group query against `rooms` by `userId`, but room membership is stored under `users/{email}/rooms/{roomID}`.
- **Identifier Mismatch**: Clerk session identifies users by email for room membership, while the query used `userId` and `collectionGroup`, causing false negatives.

### Solution Applied
**Align membership check with storage schema and Clerk session**:
```typescript
// app/auth-endpoint/route.ts (AFTER)
const userEmail = String((sessionClaims as any)?.email ?? '');
const roomDoc = await adminDB
  .collection("users")
  .doc(userEmail)
  .collection("rooms")
  .doc(room)
  .get();

if (roomDoc.exists) {
  session.allow(room, session.FULL_ACCESS);
  const { body, status } = await session.authorize();
  return new Response(body, { status });
}
```

### Key Learning
- **Use the same identifier** across systems (email vs uid) for joins/authorization.
- **Query Firestore according to your data model**; avoid broad `collectionGroup` if a direct path exists.

---

## Issue #7: Liveblocks Secret Env Var Typo Causing Init Error

### Error Message
```
Error: LIVEBLOCKS_SECRET_KEY (or LIVEBLOCKS_PRIVATE_KEY) is not set
at lib/liveblocks.ts:6:11
```

### Root Cause
- **Environment Variable Typo**: Code referenced `process.env.LIVEBLOCKS_PRIATE_KEY` (misspelled), so the secret was never read even when set.

### Solution Applied
**Fix env var name and keep backward-compatible fallback**:
```typescript
// lib/liveblocks.ts (AFTER)
const secretKey = process.env.LIVEBLOCKS_SECRET_KEY || process.env.LIVEBLOCKS_PRIVATE_KEY;

if (!secretKey) {
  throw new Error("LIVEBLOCKS_SECRET_KEY (or LIVEBLOCKS_PRIVATE_KEY) is not set");
}
```

### Key Learning
- **Validate env names** carefully; a single typo breaks initialization.
- **Support multiple variable names** during migrations to minimize downtime.

---

## Architecture Changes Summary

### BEFORE (Problematic)
```
Client Component → Firebase Client SDK → Firestore
                ↓
            Clerk Auth (not recognized by Firebase)
```

### AFTER (Working)
```
Client Component → Server Action → Firebase Admin SDK → Firestore
                ↓                    ↓
            Clerk Auth          Clerk Auth (recognized)
```

## Key Takeaways

1. **Authentication Consistency**: Use the same authentication system throughout the application
2. **Server-side Data Fetching**: For external services, prefer server-side operations
3. **Data Serialization**: Always convert complex objects to plain objects for client-server communication
4. **Framework Updates**: Stay updated with breaking changes in framework versions
5. **Error Handling**: Implement comprehensive error handling for all failure scenarios
6. **Real-time Updates**: Consider auto-refresh mechanisms for data that changes frequently

## Performance Considerations

- **Server Actions**: Each call creates a new request - consider caching strategies
- **Auto-refresh**: 5-second intervals may be too frequent for production
- **Error Boundaries**: Implement proper error boundaries for better UX
- **Loading States**: Always provide loading feedback for async operations

## Security Considerations

- **Authentication Validation**: Always validate authentication server-side
- **Data Sanitization**: Sanitize all data before database operations
- **Error Messages**: Don't expose sensitive information in error messages
- **Rate Limiting**: Consider implementing rate limiting for server actions
