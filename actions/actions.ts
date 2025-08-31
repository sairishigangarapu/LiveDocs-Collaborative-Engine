'use server';

import { adminDB } from "@/firebase-admin";
import { auth } from "@clerk/nextjs/server";

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
