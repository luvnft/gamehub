"use server";

import {
    IngressAudioEncodingPreset,
    IngressInput,
    IngressClient,
    IngressVideoEncodingPreset,
    RoomServiceClient,
    type CreateIngressOptions,
} from "livekit-server-sdk";
import { TrackSource } from "livekit-server-sdk/dist/proto/livekit_models";

import { firestore } from "@/lib/firebaseConfig";
import {
    collection,
    getDocs,
    where,
    query,
    updateDoc,
} from "firebase/firestore";
import { IUser } from "@/app/models/IUser";

import { getSelf } from "@/lib/auth-service";
import { revalidatePath } from "next/cache";

const roomService = new RoomServiceClient(
    process.env.LIVEKIT_API_URL!,
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!
);

const ingressClient = new IngressClient(process.env.LIVEKIT_API_URL!);

export const resetIngresses = async (hostIdentity: string) => {
    const ingresses = await ingressClient.listIngress({
        roomName: hostIdentity,
    });

    const rooms = await roomService.listRooms([hostIdentity]);
    for (const room of rooms) {
        await roomService.deleteRoom(room.name);
    }

    for (const ingress of ingresses) {
        if (ingress.ingressId) {
            await ingressClient.deleteIngress(ingress.ingressId);
        }
    }
};

export const createIngress = async (ingressType: IngressInput) => {
    const self = (await getSelf()) as IUser;

    await resetIngresses(self.id!);

    const options: CreateIngressOptions = {
        name: self.username,
        roomName: self.id,
        participantName: self.username,
        participantIdentity: self.id,
    };

    if (ingressType === IngressInput.WHIP_INPUT) {
        options.bypassTranscoding = true;
    } else {
        options.video = {
            source: TrackSource.CAMERA,
            preset: IngressVideoEncodingPreset.H264_1080P_30FPS_3_LAYERS,
        };
        options.audio = {
            source: TrackSource.MICROPHONE,
            preset: IngressAudioEncodingPreset.OPUS_STEREO_96KBPS,
        };
    }

    const ingress = await ingressClient.createIngress(ingressType, options);
    console.log(ingress);
    if (!ingress || !ingress.url || !ingress.streamKey) {
        throw new Error("Failed to create ingress");
    }

    const streamsCollection = collection(firestore, "streams");
    const streamQuery = query(
        streamsCollection,
        where("userId", "==", self.id)
    );

    const streamQuerySnapshot = await getDocs(streamQuery);

    const streamDocRef = streamQuerySnapshot.docs[0].ref;
    const streamData = {
        ...streamQuerySnapshot.docs[0].data(),
        ingressId: ingress.ingressId,
        serverUrl: ingress.url,
        streamKey: ingress.streamKey,
    };

    // Update the document with validData
    await updateDoc(streamDocRef, streamData);

    revalidatePath(`/u/${self.username}/keys`);

    return ingress;
};
