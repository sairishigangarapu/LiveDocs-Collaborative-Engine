import { adminDB } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

interface SessionClaims {
	fullName?: string;
	email?: string;
	image?: string;
}

export async function POST(req:NextRequest) {
	// auth() is async in Clerk v6
	const { userId, sessionClaims } = await auth();
	
	if (!userId) {
		return NextResponse.json(
			{ message: "Unauthorized" },
			{ status: 401 }
		);
	}
	
	const {room} = await req.json();

	const claims = sessionClaims as SessionClaims;

	const session = liveblocks.prepareSession(userId ?? 'anonymous',{
		userInfo :{
			name : claims?.fullName || 'Anonymous User',
			email : String(claims?.email ?? ''),
			avatar : String(claims?.image ?? ''),
		}
	});

	// Match how rooms are stored: users/{email}/rooms/{roomID}
	const userEmail = String(claims?.email ?? '');
	if (!userEmail) {
		return NextResponse.json(
			{ message: "Missing user email in session" },
			{ status: 401 }
		);
	}

	const roomDoc = await adminDB
		.collection("users")
		.doc(userEmail)
		.collection("rooms")
		.doc(room)
		.get();

    if(roomDoc.exists){
        session.allow(room,session.FULL_ACCESS);
        const {body,status} = await session.authorize();
        return new Response(body,{status});
    }
    else{
        return NextResponse.json(
            {message : "You are not in this room"},
            {status : 403}
        )
    }
}