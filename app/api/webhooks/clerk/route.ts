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
    console.log(payload.data.username);
    const usersCollection = collection(firestore, "users");

    if (eventType === "user.created") {
        try {
            await addDoc(usersCollection, {
                externalUserId: payload.data.id,
                username: payload.data.username,
                imageUrl: payload.data.image_url,
                createdAt: new Date(),
            });
        } catch (error) {
            console.error("Error inserting user:", error);
        }
    }

    if (eventType === "user.updated") {
        try {
            const usersCollection = collection(firestore, "users");
            const userQuery = query(
                usersCollection,
                where("externalUserId", "==", payload.data.id)
            );
            const querySnapshot = await getDocs(userQuery);

            if (!querySnapshot.empty) {
                const userDocRef = querySnapshot.docs[0].ref;
                await updateDoc(userDocRef, {
                    username: payload.data.username,
                    imageUrl: payload.data.image_url,
                    updatedAt: new Date().toISOString(),
                });
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
            const q = query(
                usersCollection,
                where("externalUserId", "==", payload.data.id)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const userDocRef = querySnapshot.docs[0].ref;
                await deleteDoc(userDocRef);
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
