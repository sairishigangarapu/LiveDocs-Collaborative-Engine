# Firestore User Profile Integration

## Changes Made

### ✅ Store User Profiles in Firestore

Modified the system to store and retrieve user profile information (name, email, avatar) from Firestore instead of relying solely on Liveblocks.

---

## Files Modified

### 1. `actions/actions.ts`

#### A. Updated `RoomUser` Interface
Added profile fields to the RoomUser interface:
```typescript
interface RoomUser {
    userId: string;
    role: "owner" | "editor";
    createdAt: Date;
    roomID: string;
    name?: string;      // ✅ Added
    email?: string;     // ✅ Added
    avatar?: string;    // ✅ Added
}
```

#### B. Modified `createNewDocument()`
Now stores user profile in Firestore when creating a document:
```typescript
// Store/update user profile in Firestore
await adminDB.collection("users").doc(userEmail).set({
    email: userEmail,
    name: fullName,
    avatar: avatar,
    userId: userId,
    updatedAt: new Date()
}, { merge: true });
```

#### C. Enhanced `getRoomUsers()`
Now fetches user profile data from Firestore and includes it in the response:
```typescript
// Get user profile data
const userProfileData = userDoc.data();

roomUsers.push({
    userId: email,
    role: data?.role || "editor",
    createdAt: convertFirestoreData(data?.createdAt) as Date,
    roomID: roomId,
    name: userProfileData?.name || email.split('@')[0],  // ✅ Added
    email: email,                                          // ✅ Added
    avatar: userProfileData?.avatar || ''                  // ✅ Added
});
```

---

### 2. `components/ManageUsers.tsx`

#### A. Simplified User Data Fetching
Removed dependency on Liveblocks `useOthers()` hook. Now only uses Firestore:

**Before:**
```typescript
const self = useSelf();
const others = useOthers();

// Combined Liveblocks data with Firestore
const liveUsers = [self, ...others].filter(user => user?.info?.email)
// ... complex merging logic
```

**After:**
```typescript
const self = useSelf(); // Only for current user email

// Get all user data directly from Firestore
const result = await getRoomUsers(room.id)
const users: RoomUser[] = result.users.map(user => ({
  email: user.email || user.userId,
  name: user.name || user.email?.split('@')[0] || 'Unknown',
  avatar: user.avatar || '',
  role: user.role
}))
```

#### B. Cleaner Data Flow
- User profiles are stored once in Firestore during document creation
- All user data (name, email, avatar, role) comes from a single source (Firestore)
- No need to merge multiple data sources
- More reliable and consistent user information

---

## Firestore Structure

### User Document
```
users/{userEmail}/
  ├─ email: string
  ├─ name: string
  ├─ avatar: string
  ├─ userId: string
  ├─ updatedAt: timestamp
  └─ rooms/{roomId}/
      ├─ userId: string
      ├─ role: "owner" | "editor"
      ├─ createdAt: timestamp
      └─ roomID: string
```

---

## Benefits

1. **Single Source of Truth**: All user data comes from Firestore
2. **Persistence**: User profiles persist across sessions
3. **Reliability**: Don't rely on users being online to show their info
4. **Performance**: Fetch all user data in one query
5. **Simplicity**: Removed complex data merging logic

---

## How It Works

1. **User Creates Document**:
   - User profile (name, email, avatar) stored in `users/{email}/`
   - Room access stored in `users/{email}/rooms/{roomId}/`

2. **Fetching Users**:
   - `getRoomUsers()` queries Firestore for all users with access
   - Returns complete user profiles (name, email, avatar, role)
   - Frontend displays users directly from Firestore data

3. **Display in UI**:
   - Shows user avatar (if available)
   - Shows user name (from Firestore or derived from email)
   - Shows user email
   - Shows user role (owner/editor)

---

## Testing

To verify the fix works:

1. ✅ Create a new document
2. ✅ Check Firestore: `users/{your-email}/` should have your profile
3. ✅ Open "Users" dialog - should show your name and avatar
4. ✅ Invite another user
5. ✅ Check they appear with their profile information
6. ✅ Remove a user - should work correctly

---

## Summary

**Previous Issue**: ManageUsers component relied on Liveblocks for user profiles, which only worked for currently active users.

**Solution**: Store user profiles in Firestore and fetch from there. This ensures all users are shown with their complete information, regardless of whether they're currently online.

**Result**: Users dialog now correctly displays all users with their names, emails, avatars, and roles from Firestore! 🎉
