import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { firestore } from "@/lib/firebaseConfig";
import {
    collection,
    updateDoc,
    deleteDoc,
    addDoc,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { IUser } from "@/app/models/IUser";
import { IStream, getStreamDefaultValues } from "@/app/models/IStream";

export async function POST(req: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        throw new Error(
            "Please, add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
        );
    }

    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response("Error occurred -- there is not headers of Svix", {
            status: 400,
        });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(WEBHOOK_SECRET);

    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error("Error veryfing webhook:", err);
        return new Response("Error occurred", {
            status: 400,
        });
    }

    const eventType = evt.type;
    const usersCollection = collection(firestore, "users");
    const streamsCollection = collection(firestore, "streams");

    if (eventType === "user.created") {
        try {
            const user: IUser = {
                externalUserId: payload.data.id,
                username: payload.data.username,
                imageUrl: payload.data.image_url,
                createdAt: new Date(),
            };

            // Add document user.
            const userAdded = await addDoc(usersCollection, user);
            user.id = userAdded.id;

            const stream: IStream = getStreamDefaultValues(user);

            // Now we have to create the stream doc.
            await addDoc(streamsCollection, stream);
        } catch (error) {
            console.error("Error inserting user:", error);
        }
    }

    if (eventType === "user.updated") {
        try {
            const userQuery = query(
                usersCollection,
                where("externalUserId", "==", payload.data.id)
            );
            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
                const userDocRef = querySnapshot.docs[0].ref;
                const userUpdated = {
                    username: payload.data.username,
                    imageUrl: payload.data.image_url,
                    updatedAt: new Date(),
                };
                await updateDoc(userDocRef, userUpdated);

                // Update the stream with the user
                const streamQuery = query(
                    streamsCollection,
                    where("userId", "==", userDocRef.id)
                );
                const streamQuerySnapshot = await getDocs(streamQuery);
                const streamDocRef = streamQuerySnapshot.docs[0].ref;

                const newQuerySnapshot = await getDocs(userQuery);
                const user = newQuerySnapshot.docs[0].data();

                await updateDoc(streamDocRef, { user: user });
            } else {
                console.log(
                    "User not found for update:",
                    payload.data.externalUserId
                );
            }
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }

    if (eventType === "user.deleted") {
        try {
            const queryDeleteUser = query(
                usersCollection,
                where("externalUserId", "==", payload.data.id)
            );
            const querySnapshot = await getDocs(queryDeleteUser);
            if (!querySnapshot.empty) {
                const userDocRef = querySnapshot.docs[0].ref;
                await deleteDoc(userDocRef);

                const queryDeleteStream = query(
                    streamsCollection,
                    where("userId", "==", querySnapshot.docs[0].id)
                );
                const querySnapshotStream = await getDocs(queryDeleteStream);

                const streamDocRef = querySnapshotStream.docs[0].ref;
                await deleteDoc(streamDocRef);
            } else {
                console.log(
                    "User not found with externalUserId:",
                    payload.data.id
                );
            }
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }

    return new Response("", { status: 200 });
}
