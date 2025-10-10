# Firebase User Population Debugging Guide

## Issue
Users array is not getting populated even after adding users to the document.

## Recent Changes Made

### 1. Enhanced Logging in ManageUsers Component
- Added `[CLIENT]` prefix to all console logs for easier identification
- Added detailed JSON stringified output of server responses
- Added step-by-step logging throughout the fetch process

### 2. Enhanced inviteUserToDocument Function
- Now automatically creates user profile if it doesn't exist
- Checks if user already has access before adding
- Verifies data was written successfully after invite
- Added comprehensive logging at each step

## Debugging Steps

### Step 1: Check Browser Console When Opening Dialog

Open the "Users" dialog and look for these logs in order:

```
📡 [CLIENT] Fetching users for room: {room-id}
📦 [CLIENT] getRoomUsers result: { success: true, users: [...] }
📊 [CLIENT] Raw users from server: {count}
📊 [CLIENT] Raw users data: [{...}]
📊 [CLIENT] Mapped users: {count}
👥 [CLIENT] Mapped users data: [{...}]
✅ [CLIENT] Users loaded successfully: {count} users
🏁 [CLIENT] Users loading complete
```

**If you see "Raw users from server: 0"** → The issue is on the server side
**If you see a count > 0 but UI shows "No users"** → The issue is in the rendering logic

### Step 2: Check Server Logs When Inviting a User

When you invite a user, you should see:

```
📨 [inviteUserToDocument] Starting invite process for: {email} to room: {room-id}
✅ [inviteUserToDocument] User is owner, proceeding with invite...
🔍 [inviteUserToDocument] Checking if user profile exists...
📝 [inviteUserToDocument] Creating user profile for: {email}  (or "already exists")
✅ [inviteUserToDocument] User profile created (or "already exists")
📝 [inviteUserToDocument] Adding room access...
✅ [inviteUserToDocument] Room access granted successfully
✅ [inviteUserToDocument] Verified room access data: {...}
```

### Step 3: Check Server Logs When Fetching Users

When the dialog opens, look for these server logs:

```
🔍 [getRoomUsers] Starting fetch for room: {room-id}
✅ [getRoomUsers] Fetching users for room: {room-id} by user: {email}
📄 [getRoomUsers] Fetching document to get owner...
✅ [getRoomUsers] Document owner userId: {owner-id}
📊 [getRoomUsers] Checking all users for access to this room...
📊 [getRoomUsers] Total users in collection: {count}
✅ [getRoomUsers] User {email} has access with role: {role}
✅ [getRoomUsers] Found {count} users for room
📦 [getRoomUsers] Users data: [{...}]
```

## Common Issues & Solutions

### Issue 1: "Total users in collection: 0"
**Problem**: No users exist in the Firestore `users` collection
**Solution**: 
- Check Firebase Console → Firestore Database → users collection
- Users should be created when documents are created or users are invited
- Try creating a new document to trigger user creation

### Issue 2: Users exist but "Found 0 users for room"
**Problem**: Users don't have the room in their subcollection
**Solution**:
- Check Firebase Console → Firestore Database → users/{email}/rooms/{room-id}
- This subcollection should be created when:
  - A user creates a document (as owner)
  - A user is invited to a document (as editor)
- Try inviting the user again

### Issue 3: "User already has access to this document"
**Problem**: User is already invited but not showing up
**Solution**:
- This means the data IS in Firebase but the fetch is failing
- Check the `getRoomUsers` server logs carefully
- Look for errors in the room fetching logic

### Issue 4: Server logs look good but client shows 0 users
**Problem**: Data is being lost during transfer from server to client
**Solution**:
- Check the `📦 [CLIENT] getRoomUsers result` log
- Compare server logs with client logs
- Look for serialization issues

## Manual Firebase Check

Go to Firebase Console and verify this structure exists:

```
Firestore Database/
├── documents/
│   └── {room-id}/
│       ├── owner: "{user-id}"
│       ├── title: "..."
│       └── createdAt: timestamp
│
└── users/
    └── {user-email}/
        ├── email: "{user-email}"
        ├── name: "..."
        ├── avatar: "..."
        └── rooms/
            └── {room-id}/
                ├── userId: "{user-email}"
                ├── role: "owner" or "editor"
                ├── createdAt: timestamp
                └── roomID: "{room-id}"
```

## Testing Sequence

1. **Create a new document**
   - Check server logs for user profile creation
   - Check Firebase Console for `users/{your-email}` document
   - Check Firebase Console for `users/{your-email}/rooms/{room-id}` document

2. **Open Users dialog**
   - Check browser console for fetch logs
   - Check server logs for getRoomUsers logs
   - Should show yourself as owner

3. **Invite another user**
   - Check server logs for invite process
   - Check Firebase Console for new user profile
   - Check Firebase Console for new room access
   - Close and reopen dialog to see updated list

4. **Verify in UI**
   - Should see all users with avatars, names, and roles
   - Owner should see "Remove" buttons for other users
   - Non-owners should not see "Remove" buttons

## Next Steps

Run through the testing sequence above and report back with:
1. Screenshots of browser console logs
2. Screenshots of server/terminal logs
3. Screenshot of Firebase Console showing the data structure

This will help identify exactly where the data is getting lost.
