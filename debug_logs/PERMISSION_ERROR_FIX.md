# Firebase Permission Error Fix

## Date: October 9, 2025

## Problem
```
Error loading room data: FirebaseError: Missing or insufficient permissions.
```

## Root Cause
The application was using **client-side Firebase SDK** (`react-firebase-hooks/firestore`) to query Firestore directly from the browser. However, the app uses **Clerk authentication**, not Firebase Authentication.

### Why This Failed:
1. **Firebase Security Rules** don't recognize Clerk authentication
2. **Client-side Firebase SDK** expects Firebase Auth tokens
3. **Firestore queries** from client require proper authentication context

## Architecture Problem

### BEFORE (Broken):
```
Client Component (useOwner hook)
    ↓
useCollection (react-firebase-hooks)
    ↓
Firebase Client SDK
    ↓
Firestore ❌ (Permission Denied - No Firebase Auth)
```

### AFTER (Fixed):
```
Client Component (useOwner hook)
    ↓
Server Action (checkRoomOwnership)
    ↓
Firebase Admin SDK
    ↓
Firestore ✅ (Success - Server-side has full access)
```

## Changes Made

### 1. Created Server Actions for Room Operations

**File: `actions/actions.ts`**

Added two new server actions:

#### `checkRoomOwnership(roomId: string)`
- Validates user authentication via Clerk
- Queries Firestore using Firebase Admin SDK
- Returns ownership status without exposing database to client

```typescript
export async function checkRoomOwnership(roomId: string): Promise<CheckRoomOwnershipResult> {
    const { userId, sessionClaims } = await auth(); // Clerk auth
    const userEmail = sessionClaims.email as string;
    
    // Use Firebase Admin SDK (server-side)
    const userRoomRef = adminDB
        .collection("users")
        .doc(userEmail)
        .collection("rooms")
        .doc(roomId);
    
    const userRoomDoc = await userRoomRef.get();
    const isOwner = userRoomDoc.data()?.role === "owner";
    
    return { success: true, isOwner };
}
```

#### `getRoomUsers(roomId: string)`
- Fetches all users who have access to a room
- Verifies requesting user has access before returning data
- Returns serialized user data

```typescript
export async function getRoomUsers(roomId: string): Promise<GetRoomUsersResult> {
    const { userId, sessionClaims } = await auth();
    const userEmail = sessionClaims.email as string;
    
    // Verify user has access to this room
    // Then fetch all users with access
    // Return serialized data
}
```

### 2. Updated useOwner Hook

**File: `lib/useOwner.ts`**

**BEFORE:**
```typescript
// ❌ Client-side Firebase query
const [usersInRoom, loading, error] = useCollection(
    currentUserEmail && room?.id ? query(
      collection(db, "users", currentUserEmail, "rooms"),
      where("roomID", "==", room.id)
    ) : null
);
```

**AFTER:**
```typescript
// ✅ Server action call
const checkOwnership = async () => {
    const result = await checkRoomOwnership(room.id);
    if (result.success) {
        setIsOwner(result.isOwner);
    }
};
```

### 3. Updated ManageUsers Component

**File: `components/ManageUsers.tsx`**

**BEFORE:**
```typescript
// ❌ Client-side Firebase query
const [usersInRoom] = useCollection(
    user && query(collectionGroup(db,"rooms"),where("roomID","==",room.id))
);
```

**AFTER:**
```typescript
// ✅ Server action call
useEffect(() => {
    if (isOpen && room?.id) {
        getRoomUsers(room.id)
            .then((result) => {
                if (result.success && result.users) {
                    setUsersInRoom(result.users);
                }
            });
    }
}, [isOpen, room?.id]);
```

## Security Benefits

### 1. **Server-side Validation**
- All database queries are validated server-side
- Clerk authentication is properly checked before any operation
- No direct client access to Firestore

### 2. **Data Protection**
- Sensitive data is filtered server-side
- Only authorized users can access room information
- Admin SDK has proper security context

### 3. **Consistent Architecture**
- All data operations now use server actions
- Follows Next.js best practices
- Matches existing patterns (createNewDocument, getDocument, etc.)

## Performance Considerations

### Trade-offs:
- ✅ **Better Security**: No client-side database access
- ✅ **Consistent Auth**: All operations use Clerk
- ⚠️ **Network Round-trip**: Each call goes through server
- ⚠️ **No Real-time**: Lost Firebase real-time updates

### Mitigation:
- Added loading states for better UX
- Refresh data when dialog opens
- Could add polling or webhook for real-time updates if needed

## Testing Checklist

- [x] User can view documents they own
- [x] User can view documents shared with them
- [x] Ownership status correctly determined
- [x] ManageUsers dialog shows all users
- [x] No permission errors in console
- [x] Loading states work correctly
- [ ] Invite user functionality works
- [ ] Remove user functionality works

## Related Issues Fixed

This change also resolves:
- `useCollection is not defined` warnings
- Firebase client SDK initialization errors
- Authentication state mismatches

## Files Modified

1. ✅ `actions/actions.ts` - Added checkRoomOwnership and getRoomUsers
2. ✅ `lib/useOwner.ts` - Converted to use server action
3. ✅ `components/ManageUsers.tsx` - Converted to use server action
4. ✅ `components/Editor.tsx` - Already fixed (earlier)
5. ✅ `firebase.ts` - Improved initialization (earlier)

## Dependencies Removed

The following client-side Firebase dependencies are no longer needed in these components:
- `react-firebase-hooks/firestore` (useCollection, useDocumentData)
- `firebase/firestore` (collection, query, where, collectionGroup)
- Client-side `db` import

These can still be used elsewhere if needed, but all user/room queries should use server actions.

## Migration Guide for Similar Components

If you have other components using client-side Firebase queries:

1. **Create a Server Action**:
   ```typescript
   export async function yourServerAction() {
       const { userId, sessionClaims } = await auth();
       // Validate authentication
       // Use adminDB for queries
       // Return serialized data
   }
   ```

2. **Update Component**:
   ```typescript
   // Remove: useCollection, useDocumentData
   // Add: useState, useEffect
   useEffect(() => {
       yourServerAction().then(result => {
           setState(result.data);
       });
   }, [dependencies]);
   ```

3. **Test Thoroughly**:
   - Authentication edge cases
   - Loading states
   - Error handling
   - Data refresh scenarios

## Future Improvements

1. **Real-time Updates**: Consider implementing Server-Sent Events or WebSockets for real-time data
2. **Caching**: Add caching layer to reduce server action calls
3. **Optimistic Updates**: Update UI immediately, sync with server in background
4. **Rate Limiting**: Add rate limiting to prevent abuse of server actions

---

**Status**: ✅ Permission error resolved  
**Risk**: Low - All changes follow existing patterns  
**Rollback**: Revert to previous commits if needed (changes are isolated)
