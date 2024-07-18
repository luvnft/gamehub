import { headers } from "next/headers";
import { WebhookReceiver } from "livekit-server-sdk";
import { firestore } from "@/lib/firebaseConfig";
import {
    collection,
    updateDoc,
    query,
    where,
    getDocs,
} from "firebase/firestore";

const receiver = new WebhookReceiver(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
);

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const headerPayload = headers();
        const authorization = headerPayload.get("Authorization");

        if (!authorization) {
            return new Response("No authorization header", { status: 400 });
        }

        const event = receiver.receive(body, authorization);

        const { ingressId } = event.ingressInfo || {};
        const { event: eventType } = event;

        if (!ingressId) {
            return new Response("Invalid ingressId", { status: 400 });
        }

        const streamsCollection = collection(firestore, "streams");
        const streamQuery = query(
            streamsCollection,
            where("ingressId", "==", ingressId)
        );

        if (eventType === "ingress_ended" || eventType === "ingress_started") {
            const streamQuerySnapshot = await getDocs(streamQuery);

            if (streamQuerySnapshot.empty) {
                return new Response(
                    "No stream found with the given ingressId",
                    {
                        status: 404,
                    }
                );
            }

            const streamDoc = streamQuerySnapshot.docs[0];
            const isLive = eventType === "ingress_started";

            await updateDoc(streamDoc.ref, { isLive });

            return new Response(
                `Stream ${isLive ? "started" : "ended"} successfully`,
                { status: 200 }
            );
        }

        return new Response("Invalid event type", { status: 400 });
    } catch (error) {
        console.error("Error processing webhook event:", error);
        return new Response("Internal server error", { status: 500 });
    }
}
