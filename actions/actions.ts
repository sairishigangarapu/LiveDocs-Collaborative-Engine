'use server';

import { adminDB } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";

// Helper function to convert Firestore data to plain objects
function convertFirestoreData(data: any): any {
    if (data === null || data === undefined) {
        return data;
    }
    
    // Handle Firestore Timestamps
    if (data && typeof data === 'object' && data.constructor.name === 'Timestamp') {
        return data.toDate();
    }
    
    // Handle Firestore DocumentReferences
    if (data && typeof data === 'object' && data.constructor.name === 'DocumentReference') {
        return data.path;
    }
    
    // Handle Firestore GeoPoints
    if (data && typeof data === 'object' && data.constructor.name === 'GeoPoint') {
        return { latitude: data.latitude, longitude: data.longitude };
    }
    
    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => convertFirestoreData(item));
    }
    
    // Handle plain objects
    if (typeof data === 'object') {
        const converted: any = {};
        Object.keys(data).forEach(key => {
            converted[key] = convertFirestoreData(data[key]);
        });
        return converted;
    }
    
    // Return primitive values as-is
    return data;
}

interface CreateDocumentResult {
    success: boolean;
    docID?: string;
    error?: string;
}

export async function createNewDocument(): Promise<CreateDocumentResult> {
    try {
        console.log('🚀 Starting document creation...');
        
        // Validate user authentication
        const { userId, sessionClaims } = await auth();
        
        console.log('🔍 Auth check:', { 
            userId: userId ? 'Present' : 'Missing', 
            email: sessionClaims?.email ? 'Present' : 'Missing',
            sessionClaims: sessionClaims ? 'Present' : 'Missing'
        });

        if (!userId || !sessionClaims?.email) {
            console.error('❌ Document creation failed: User not authenticated');
            console.log('Auth details:', { userId, sessionClaims });
            return {
                success: false,
                error: "Please sign in to create a document"
            };
        }

        const userEmail = sessionClaims.email as string;
        const fullName = (sessionClaims as any)?.fullName || userEmail.split('@')[0];
        const avatar = (sessionClaims as any)?.image || '';
        
        console.log(`✅ Creating document for user: ${userId} (${userEmail})`);

        // Validate Firebase connection before attempting operations
        if (!adminDB) {
            console.error('❌ Firebase admin database not initialized');
            return {
                success: false,
                error: "Database connection error. Please try again later."
            };
        }

        console.log('🔥 Firebase connection validated, creating document...');

        // Store/update user profile in Firestore
        await adminDB.collection("users").doc(userEmail).set({
            email: userEmail,
            name: fullName,
            avatar: avatar,
            userId: userId,
            updatedAt: new Date()
        }, { merge: true });

        // Create document in Firestore
        const docCollectionRef = adminDB.collection("documents");
        console.log('📝 Adding document to collection...');
        
        const docRef = await docCollectionRef.add({
            owner: userId,
            title: "New Doc",
            createdAt: new Date(),
        });

        console.log(`✅ Document created with ID: ${docRef.id}`);

        // Create user-document relationship
        console.log('👤 Creating user-document relationship...');
        await adminDB.collection("users").doc(userEmail).collection('rooms').doc(docRef.id).set({
            userId: userEmail,
            role: "owner",
            createdAt: new Date(),
            roomID: docRef.id,
        });

        console.log(`✅ User-document relationship created for: ${userEmail}`);

        return {
            success: true,
            docID: docRef.id
        };

    } catch (error) {
        // Log detailed error for debugging
        console.error('❌ Document creation failed:', error);
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : 'No stack trace'
        });
        
        // Determine user-friendly error message
        let userMessage = "Failed to create document. Please try again.";
        
        if (error instanceof Error) {
            // Handle specific Firebase errors
            if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
                userMessage = "You don't have permission to create documents.";
            } else if (error.message.includes('network') || error.message.includes('timeout') || error.message.includes('UNAVAILABLE')) {
                userMessage = "Network error. Please check your connection and try again.";
            } else if (error.message.includes('Firebase') || error.message.includes('credential') || error.message.includes('authentication')) {
                userMessage = "Database connection error. Please try again later.";
            } else if (error.message.includes('Missing required Firebase environment variables')) {
                userMessage = "Service configuration error. Please contact support.";
            }
        }

        return {
            success: false,
            error: userMessage
        };
    }
}

interface DocumentData {
    title?: string;
    owner?: string;
    createdAt?: Date;
    [key: string]: unknown;
}

interface GetDocumentResult {
    success: boolean;
    data?: DocumentData;
    error?: string;
}

interface UpdateDocumentResult {
    success: boolean;
    error?: string;
}

export async function getDocument(docId: string): Promise<GetDocumentResult> {
    try {
        console.log('🔍 Fetching document:', docId);
        
        // Validate user authentication
        const { userId, sessionClaims } = await auth();
        
        if (!userId || !sessionClaims?.email) {
            console.error('❌ Document fetch failed: User not authenticated');
            return {
                success: false,
                error: "Please sign in to view documents"
            };
        }

        const userEmail = sessionClaims.email as string;
        console.log(`✅ Fetching document for user: ${userId} (${userEmail})`);

        // Validate Firebase connection
        if (!adminDB) {
            console.error('❌ Firebase admin database not initialized');
            return {
                success: false,
                error: "Database connection error. Please try again later."
            };
        }

        console.log('🔥 Firebase connection validated, fetching document...');

        // Get document from Firestore
        const docRef = adminDB.collection("documents").doc(docId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.log('❌ Document not found:', docId);
            return {
                success: false,
                error: "Document not found"
            };
        }

        const docData = docSnap.data();
        console.log(`✅ Document fetched successfully:`, docData);

        // Convert Firestore data to plain object for client serialization
        const plainData = convertFirestoreData(docData) as DocumentData;

        return {
            success: true,
            data: plainData
        };

    } catch (error) {
        console.error('❌ Document fetch failed:', error);
        
        let userMessage = "Failed to load document. Please try again.";
        
        if (error instanceof Error) {
            if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
                userMessage = "You don't have permission to view this document.";
            } else if (error.message.includes('network') || error.message.includes('timeout')) {
                userMessage = "Network error. Please check your connection and try again.";
            }
        }

        return {
            success: false,
            error: userMessage
        };
    }
}

export async function updateDocument(docId: string, updates: Partial<DocumentData>): Promise<UpdateDocumentResult> {
    try {
        console.log('📝 Updating document:', docId, updates);
        
        // Validate user authentication
        const { userId, sessionClaims } = await auth();
        
        if (!userId || !sessionClaims?.email) {
            console.error('❌ Document update failed: User not authenticated');
            return {
                success: false,
                error: "Please sign in to update documents"
            };
        }

        const userEmail = sessionClaims.email as string;
        console.log(`✅ Updating document for user: ${userId} (${userEmail})`);

        // Validate Firebase connection
        if (!adminDB) {
            console.error('❌ Firebase admin database not initialized');
            return {
                success: false,
                error: "Database connection error. Please try again later."
            };
        }

        console.log('🔥 Firebase connection validated, updating document...');

        // Update document in Firestore
        const docRef = adminDB.collection("documents").doc(docId);
        await docRef.update(updates);

        console.log(`✅ Document updated successfully`);

        return {
            success: true
        };

    } catch (error) {
        console.error('❌ Document update failed:', error);
        
        let userMessage = "Failed to update document. Please try again.";
        
        if (error instanceof Error) {
            if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
                userMessage = "You don't have permission to update this document.";
            } else if (error.message.includes('network') || error.message.includes('timeout')) {
                userMessage = "Network error. Please check your connection and try again.";
            }
        }

        return {
            success: false,
            error: userMessage
        };
    }
}

interface UserDocument {
    id: string;
    userId: string;
    role: "owner" | "editor";
    createdAt: Date;
    roomID: string;
    title?: string;
}

interface GetUserDocumentsResult {
    success: boolean;
    documents?: UserDocument[];
    error?: string;
}

interface DeleteDocumentResult {
    success: boolean;
    error?: string;
}

export async function getUserDocuments(): Promise<GetUserDocumentsResult> {
    try {
        console.log('🔍 Fetching user documents...');
        
        // Validate user authentication
        const { userId, sessionClaims } = await auth();
        
        if (!userId || !sessionClaims?.email) {
            console.error('❌ Document fetch failed: User not authenticated');
            return {
                success: false,
                error: "Please sign in to view documents"
            };
        }

        const userEmail = sessionClaims.email as string;
        console.log(`✅ Fetching documents for user: ${userId} (${userEmail})`);

        // Validate Firebase connection
        if (!adminDB) {
            console.error('❌ Firebase admin database not initialized');
            return {
                success: false,
                error: "Database connection error. Please try again later."
            };
        }

        console.log('🔥 Firebase connection validated, fetching user documents...');

        // Get user's room documents
        const roomsSnapshot = await adminDB
            .collection("users")
            .doc(userEmail)
            .collection("rooms")
            .get();

        if (roomsSnapshot.empty) {
            console.log('📭 No documents found for user');
            return {
                success: true,
                documents: []
            };
        }

        // Get document titles for each room
        const documents: UserDocument[] = [];
        
        for (const roomDoc of roomsSnapshot.docs) {
            const roomData = roomDoc.data();
            
            // Get the actual document to get the title
            const docSnapshot = await adminDB
                .collection("documents")
                .doc(roomData.roomID)
                .get();
            
            if (docSnapshot.exists) {
                const docData = docSnapshot.data();
                documents.push({
                    id: roomDoc.id,
                    userId: roomData.userId,
                    role: roomData.role,
                    createdAt: convertFirestoreData(roomData.createdAt) as Date,
                    roomID: roomData.roomID,
                    title: docData?.title || "Untitled"
                });
            }
        }

        // Sort by creation date (newest first)
        documents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        console.log(`✅ Found ${documents.length} documents for user`);

        return {
            success: true,
            documents
        };

    } catch (error) {
        console.error('❌ Failed to fetch user documents:', error);
        
        let userMessage = "Failed to load documents. Please try again.";
        
        if (error instanceof Error) {
            if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
                userMessage = "You don't have permission to view documents.";
            } else if (error.message.includes('network') || error.message.includes('timeout')) {
                userMessage = "Network error. Please check your connection and try again.";
            }
        }

        return {
            success: false,
            error: userMessage
        };
    }
}

export async function deleteDocument(docId: string): Promise<DeleteDocumentResult> {
    try {
        console.log('🗑️ Deleting document:', docId);
        
        // Validate user authentication
        const { userId, sessionClaims } = await auth();
        
        if (!userId || !sessionClaims?.email) {
            console.error('❌ Document deletion failed: User not authenticated');
            return {
                success: false,
                error: "Please sign in to delete documents"
            };
        }

        const userEmail = sessionClaims.email as string;
        console.log(`✅ Deleting document for user: ${userId} (${userEmail})`);

        // Validate Firebase connection
        if (!adminDB) {
            console.error('❌ Firebase admin database not initialized');
            return {
                success: false,
                error: "Database connection error. Please try again later."
            };
        }

        // Check if user is owner of the document
        const userRoomRef = adminDB.collection("users").doc(userEmail).collection("rooms").doc(docId);
        const userRoomDoc = await userRoomRef.get();
        
        if (!userRoomDoc.exists || userRoomDoc.data()?.role !== "owner") {
            console.error('❌ User is not owner of this document');
            return {
                success: false,
                error: "You don't have permission to delete this document"
            };
        }

        console.log('🔥 User is owner, proceeding with deletion...');

        // Step 1: Delete the document reference itself
        console.log('📄 Step 1: Deleting document from documents collection...');
        const docRef = adminDB.collection("documents").doc(docId);
        await docRef.delete();
        console.log('✅ Document deleted from documents collection');

        // Step 2: Delete room references from all users' collections
        console.log('👥 Step 2: Deleting room references from all users...');
        
        // Get all users who have access to this room
        const allUsersSnapshot = await adminDB.collection("users").get();
        
        const deletePromises = [];
        for (const userDoc of allUsersSnapshot.docs) {
            const userEmail = userDoc.id;
            const userRoomRef = adminDB
                .collection("users")
                .doc(userEmail)
                .collection("rooms")
                .doc(docId);
            
            // Check if this user has access to the room
            const roomDoc = await userRoomRef.get();
            if (roomDoc.exists) {
                deletePromises.push(userRoomRef.delete());
                console.log(`🗑️ Deleting room reference for user: ${userEmail}`);
            }
        }
        
        // Wait for all user room deletions to complete
        await Promise.all(deletePromises);
        console.log('✅ All room references deleted from users collections');

        // Step 3: Delete the room from Liveblocks
        console.log('🎮 Step 3: Deleting room from Liveblocks...');
        try {
            const liveblocks = await import('@/lib/liveblocks');
            await liveblocks.default.deleteRoom(docId);
            console.log('✅ Room deleted from Liveblocks');
        } catch (liveblocksError) {
            console.warn('⚠️ Failed to delete room from Liveblocks:', liveblocksError);
            // Don't fail the entire operation if Liveblocks deletion fails
            // The room will eventually be cleaned up by Liveblocks' own cleanup processes
        }

        console.log(`✅ Document deletion completed successfully`);

        return {
            success: true
        };

    } catch (error) {
        console.error('❌ Document deletion failed:', error);
        
        let userMessage = "Failed to delete document. Please try again.";
        
        if (error instanceof Error) {
            if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
                userMessage = "You don't have permission to delete this document.";
            } else if (error.message.includes('network') || error.message.includes('timeout')) {
                userMessage = "Network error. Please check your connection and try again.";
            }
        }

        return {
            success: false,
            error: userMessage
        };
    }
}

export async function inviteUserToDocument(roomId:string,email:string){
    auth.protect()
    console.log("📨 [inviteUserToDocument] Starting invite process for:", email, "to room:", roomId)

    try{
        // Validate DB
        if(!adminDB){
            console.error('❌ [inviteUserToDocument] Database not initialized')
            return { success:false, error:"Database not initialized" }
        }

        // Check if current user is the owner
        const ownershipCheck = await checkRoomOwnership(roomId);
        if (!ownershipCheck.success || !ownershipCheck.isOwner) {
            console.error('❌ [inviteUserToDocument] User is not the owner');
            return {
                success: false,
                error: "Only the owner can invite users to this document"
            };
        }

        console.log('✅ [inviteUserToDocument] User is owner, proceeding with invite...');

        // Sanitize inputs
        const safeEmail = (email ?? "").trim()
        const safeRoomId = (roomId ?? "").trim()

        if(!safeEmail || !safeRoomId){
            console.error('❌ [inviteUserToDocument] Missing email or roomId')
            return { success:false, error:"Email and roomId are required" }
        }
        if(safeEmail.includes("/") || safeRoomId.includes("/")){
            console.error('❌ [inviteUserToDocument] Invalid characters in identifiers')
            return { success:false, error:"Invalid characters in identifiers" }
        }

        // Check if user document exists, create if it doesn't
        console.log('🔍 [inviteUserToDocument] Checking if user profile exists...')
        const userDocRef = adminDB.collection("users").doc(safeEmail)
        const userDoc = await userDocRef.get()
        
        if (!userDoc.exists) {
            console.log('📝 [inviteUserToDocument] Creating user profile for:', safeEmail)
            await userDocRef.set({
                email: safeEmail,
                name: safeEmail.split('@')[0],
                avatar: '',
                userId: safeEmail,
                createdAt: new Date()
            })
            console.log('✅ [inviteUserToDocument] User profile created')
        } else {
            console.log('✅ [inviteUserToDocument] User profile already exists')
        }

        // Check if user already has access
        const roomRef = adminDB
            .collection("users")
            .doc(safeEmail)
            .collection("rooms")
            .doc(safeRoomId)
        
        const existingRoom = await roomRef.get()
        if (existingRoom.exists) {
            console.log('⚠️ [inviteUserToDocument] User already has access to this room')
            return { success: false, error: "User already has access to this document" }
        }

        // Add room access
        console.log('📝 [inviteUserToDocument] Adding room access...')
        await roomRef.set({
            userId: safeEmail,
            role: "editor",
            createdAt: new Date(),
            roomID: safeRoomId
        });
        
        console.log('✅ [inviteUserToDocument] Room access granted successfully')
        
        // Verify the data was written
        const verifyRoom = await roomRef.get()
        if (verifyRoom.exists) {
            console.log('✅ [inviteUserToDocument] Verified room access data:', verifyRoom.data())
        } else {
            console.error('❌ [inviteUserToDocument] Failed to verify room access!')
        }
        
        return { success: true }
    }catch(error){
        console.error('❌ [inviteUserToDocument] Error:', error);
        return { success:false, error: error instanceof Error ? error.message : "Unknown error" }
    }
}

interface RemoveUserResult {
    success: boolean;
    error?: string;
}

export async function removeUserFromDocument(roomId: string, emailToRemove: string): Promise<RemoveUserResult> {
    try {
        console.log('🗑️ [removeUserFromDocument] Removing user:', emailToRemove, 'from room:', roomId);
        
        // Validate user authentication
        const { userId, sessionClaims } = await auth();
        
        if (!userId || !sessionClaims?.email) {
            console.error('❌ [removeUserFromDocument] User not authenticated');
            return {
                success: false,
                error: "Please sign in to remove users"
            };
        }

        const currentUserEmail = sessionClaims.email as string;
        console.log(`✅ [removeUserFromDocument] Current user: ${currentUserEmail}`);

        // Validate Firebase connection
        if (!adminDB) {
            console.error('❌ Firebase admin database not initialized');
            return {
                success: false,
                error: "Database connection error"
            };
        }

        // Check if current user is the owner
        const ownershipCheck = await checkRoomOwnership(roomId);
        if (!ownershipCheck.success || !ownershipCheck.isOwner) {
            console.error('❌ [removeUserFromDocument] User is not the owner');
            return {
                success: false,
                error: "Only the owner can remove users"
            };
        }

        console.log('✅ [removeUserFromDocument] User is owner, proceeding with removal...');

        // Sanitize email
        const safeEmail = (emailToRemove ?? "").trim();
        const safeRoomId = (roomId ?? "").trim();

        if (!safeEmail || !safeRoomId) {
            return { success: false, error: "Email and roomId are required" };
        }
        
        if (safeEmail.includes("/") || safeRoomId.includes("/")) {
            return { success: false, error: "Invalid characters in identifiers" };
        }

        // Don't allow removing yourself
        if (safeEmail === currentUserEmail) {
            return { success: false, error: "You cannot remove yourself from the document" };
        }

        // Remove user's room access
        await adminDB
            .collection("users")
            .doc(safeEmail)
            .collection("rooms")
            .doc(safeRoomId)
            .delete();

        console.log('✅ [removeUserFromDocument] User removed successfully');

        return { success: true };

    } catch (error) {
        console.error('❌ [removeUserFromDocument] Failed:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to remove user"
        };
    }
}

interface RoomUser {
    userId: string;
    role: "owner" | "editor";
    createdAt: Date;
    roomID: string;
    name?: string;
    email?: string;
    avatar?: string;
}

interface GetRoomUsersResult {
    success: boolean;
    users?: RoomUser[];
    error?: string;
}

export async function getRoomUsers(roomId: string): Promise<GetRoomUsersResult> {
    try {
        console.log('🔍 [getRoomUsers] Starting fetch for room:', roomId);
        
        // Validate user authentication
        const { userId, sessionClaims } = await auth();
        
        console.log('🔍 [getRoomUsers] Auth details:', {
            userId: userId ? 'Present' : 'Missing',
            email: sessionClaims?.email ? sessionClaims.email : 'Missing'
        });
        
        if (!userId || !sessionClaims?.email) {
            console.error('❌ [getRoomUsers] Users fetch failed: User not authenticated');
            return {
                success: false,
                error: "Please sign in to view users"
            };
        }

        const userEmail = sessionClaims.email as string;
        console.log(`✅ [getRoomUsers] Fetching users for room: ${roomId} by user: ${userEmail}`);

        // Validate Firebase connection
        if (!adminDB) {
            console.error('❌ Firebase admin database not initialized');
            return {
                success: false,
                error: "Database connection error"
            };
        }

        // Get the document to find the owner
        console.log('📄 [getRoomUsers] Fetching document to get owner...');
        const docRef = adminDB.collection("documents").doc(roomId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            console.log('❌ [getRoomUsers] Document not found:', roomId);
            return {
                success: false,
                error: "Document not found"
            };
        }

        const docData = docSnap.data();
        const ownerId = docData?.owner;
        
        console.log(`✅ [getRoomUsers] Document owner userId: ${ownerId}`);

        const roomUsers: RoomUser[] = [];
        const addedEmails = new Set<string>(); // Track added users to avoid duplicates

        // Strategy: Loop through ALL users and check if they have access to this room
        console.log('📊 [getRoomUsers] Checking all users for access to this room...');
        const allUsersSnapshot = await adminDB.collection("users").get();
        console.log(`📊 [getRoomUsers] Total users in collection: ${allUsersSnapshot.docs.length}`);
        
        for (const userDoc of allUsersSnapshot.docs) {
            const email = userDoc.id;
            
            // Check if this user has a room document for this roomId
            const roomRef = adminDB
                .collection("users")
                .doc(email)
                .collection("rooms")
                .doc(roomId);
            
            const roomDoc = await roomRef.get();
            
            if (roomDoc.exists) {
                const roomData = roomDoc.data();
                const userProfileData = userDoc.data();
                
                console.log(`✅ [getRoomUsers] User ${email} has access with role: ${roomData?.role}`);
                
                roomUsers.push({
                    userId: email,
                    role: roomData?.role || "editor",
                    createdAt: convertFirestoreData(roomData?.createdAt) as Date,
                    roomID: roomId,
                    name: userProfileData?.name || email.split('@')[0],
                    email: email,
                    avatar: userProfileData?.avatar || ''
                });
                
                addedEmails.add(email);
            }
        }

        console.log(`✅ [getRoomUsers] Found ${roomUsers.length} users for room`);
        console.log(`📦 [getRoomUsers] Users data:`, JSON.stringify(roomUsers, null, 2));

        return {
            success: true,
            users: roomUsers
        };

    } catch (error) {
        console.error('❌ Failed to fetch room users:', error);
        
        let userMessage = "Failed to load users. Please try again.";
        
        if (error instanceof Error) {
            if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
                userMessage = "You don't have permission to view users.";
            } else if (error.message.includes('network') || error.message.includes('timeout')) {
                userMessage = "Network error. Please check your connection and try again.";
            }
        }

        return {
            success: false,
            error: userMessage
        };
    }
}

interface CheckRoomOwnershipResult {
    success: boolean;
    isOwner: boolean;
    error?: string;
}

export async function checkRoomOwnership(roomId: string): Promise<CheckRoomOwnershipResult> {
    try {
        console.log('🔍 Checking room ownership:', roomId);
        
        // Validate user authentication
        const { userId, sessionClaims } = await auth();
        
        if (!userId || !sessionClaims?.email) {
            console.error('❌ Ownership check failed: User not authenticated');
            return {
                success: false,
                isOwner: false,
                error: "Please sign in to check ownership"
            };
        }

        const userEmail = sessionClaims.email as string;
        console.log(`✅ Checking ownership for user: ${userId} (${userEmail})`);

        // Validate Firebase connection
        if (!adminDB) {
            console.error('❌ Firebase admin database not initialized');
            return {
                success: false,
                isOwner: false,
                error: "Database connection error"
            };
        }

        // Check if user has access to this room
        const userRoomRef = adminDB
            .collection("users")
            .doc(userEmail)
            .collection("rooms")
            .doc(roomId);
        
        const userRoomDoc = await userRoomRef.get();

        if (!userRoomDoc.exists) {
            // User has no access to this room
            console.log('📭 User has no access to room:', roomId);
            return {
                success: true,
                isOwner: false
            };
        }

        const roomData = userRoomDoc.data();
        const isOwner = roomData?.role === "owner";

        console.log(`✅ Ownership check complete - isOwner: ${isOwner}`);

        return {
            success: true,
            isOwner
        };

    } catch (error) {
        console.error('❌ Ownership check failed:', error);
        
        let userMessage = "Failed to check ownership. Please try again.";
        
        if (error instanceof Error) {
            if (error.message.includes('permission') || error.message.includes('PERMISSION_DENIED')) {
                userMessage = "You don't have permission to access this room.";
            } else if (error.message.includes('network') || error.message.includes('timeout')) {
                userMessage = "Network error. Please check your connection and try again.";
            }
        }

        return {
            success: false,
            isOwner: false,
            error: userMessage
        };
    }
}