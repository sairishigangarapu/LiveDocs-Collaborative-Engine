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
    [key: string]: any;
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