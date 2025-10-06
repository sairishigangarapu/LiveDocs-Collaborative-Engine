import { adminDB } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest) {
	auth.protect();
	const { userId, sessionClaims } = await auth();
	const {room} = await req.json();

	const session = liveblocks.prepareSession(userId ?? 'anonymous',{
		userInfo :{
			name : (sessionClaims as any)?.fullName || 'Anonymous User',
			email : String((sessionClaims as any)?.email ?? ''),
			avatar : String((sessionClaims as any)?.image ?? ''),
		}
	});

	// Match how rooms are stored: users/{email}/rooms/{roomID}
	const userEmail = String((sessionClaims as any)?.email ?? '');
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