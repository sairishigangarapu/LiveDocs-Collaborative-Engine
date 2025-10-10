# Debug: User Not Appearing in Dialog

## Issue
The dialog opens, but your name/email is not appearing in the users list.

## What This Means
Since `isOwner: true` is showing in the logs, your user record EXISTS in Firestore at:
```
users/{your-email}/rooms/{room-id}/
  - userId: {your-email}
  - role: "owner"
  - roomID: {room-id}
```

But the `getRoomUsers` function might not be returning this data.

## Steps to Debug

### 1. Open Browser Console (F12)
Look for these specific logs when you open the Users dialog:

```
🚪 Dialog state changing: true
🔄 Users fetch effect triggered: { isOpen: true, roomId: "xxx" }
📡 Fetching users for room: xxx
```

Then look for:
```
📦 getRoomUsers result: { success: true/false, users: [...] }
```

**Critical Question: What does the getRoomUsers result show?**

#### Scenario A: `users: []` (empty array)
This means the server function is not finding your user record.

#### Scenario B: `users: [{userId: "email", role: "owner", ...}]`
This means data is being returned but not rendering.

### 2. Check Terminal/Server Logs
In your Next.js terminal, look for:

```
🔍 [getRoomUsers] Starting fetch for room: xxx
📊 [getRoomUsers] Total users in collection: X
✅ [getRoomUsers] User your@email.com has access with role: owner
✅ [getRoomUsers] Found X users for room
📦 [getRoomUsers] Users data: [...]
```

**Critical Question: How many users does it say it found?**

### 3. Check the Render Log
Look for:
```
🎨 ManageUsers Render: {
  isOpen: true,
  isOwner: true,
  loadingUsers: false,
  usersInRoom: 0 or 1,
  usersData: "...",
  showingNoUsers: true/false,
  showingUsersList: true/false
}
```

**Critical Questions:**
- What is `usersInRoom`? (0 or 1?)
- What is `showingNoUsers`? (true or false?)
- What is the `usersData` value?

### 4. Check User Mapping Log
For each user being rendered, you should see:
```
👤 Rendering user: {
  userEmail: "your@email.com",
  currentUserEmail: "your@email.com",
  isCurrentUser: true/false,
  match: true/false
}
```

**Critical Question: Does this log appear? If yes, what are the values?**

## Most Likely Issues

### Issue #1: getRoomUsers Returning Empty Array
**Symptom:**
- Server logs show "Found 0 users for room"
- Client shows `usersInRoom: 0`
- Dialog shows "No users with access yet"

**Cause:** The server is not finding your user record in Firestore.

**Solution:** Check Firestore manually - does `users/{your-email}/rooms/{room-id}` exist?

### Issue #2: Data Returned But Not Setting State
**Symptom:**
- Server logs show "Found 1 users for room"
- Client initially shows `usersInRoom: 0`
- Dialog shows "No users with access yet"

**Cause:** `setUsersInRoom(result.users)` is not working or being called with wrong data.

**Solution:** Check the `📦 getRoomUsers result` log - is it successful?

### Issue #3: Data in State But Not Rendering
**Symptom:**
- Client shows `usersInRoom: 1`
- `usersData` shows your email
- But UI still shows "No users with access yet"

**Cause:** Rendering logic issue - the condition `usersInRoom.length > 0` might be failing.

**Solution:** Check if `usersInRoom` is actually an array.

## Quick Test

Run this in your browser console when the dialog is open:
```javascript
// Check the component state
console.log('Users in room:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
```

Or simply look at the "Users (X)" button text:
- If it says "Users (0)" → No users in state
- If it says "Users (1)" → You're in state but not rendering

## What to Share

Please share:
1. The `📦 getRoomUsers result` log from browser console
2. The `📊 [getRoomUsers] Found X users for room` log from terminal
3. The `🎨 ManageUsers Render` log showing `usersInRoom` and `showingNoUsers` values
4. What the "Users (X)" button shows - what number is X?
