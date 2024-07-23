import { getSelf } from "@/lib/auth-service";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { firestore } from "@/lib/firebaseConfig";
import {
    collection,
    query,
    where,
    getDocs,
    updateDoc,
} from "firebase/firestore";

const f = createUploadthing();

export const ourFileRouter = {
    thumbnailUploader: f({
        image: { maxFileSize: "4MB", maxFileCount: 1 },
    })
        .middleware(async () => {
            // Get the current user
            const self = await getSelf();
            return { user: self };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            // Get the user ID from the metadata
            const userId = metadata.user.id;
            console.log(userId);

            // Create a reference to the Firestore collection
            const streamsCollection = collection(firestore, "streams");

            // Create a query to find the document where userId matches
            const q = query(streamsCollection, where("userId", "==", userId));

            try {
                // Execute the query to find the document
                const querySnapshot = await getDocs(q);

                // Check if a document is found
                if (querySnapshot.empty) {
                    throw new UploadThingError("No document found for user ID");
                }

                // Assume there's only one document, get the first one
                const docRef = querySnapshot.docs[0].ref;

                // Update the document with the new thumbnail URL
                await updateDoc(docRef, {
                    thumbnailUrl: file.url,
                });

                // Return the file URL for confirmation
                return { fileUrl: file.url };
            } catch (error) {
                // Log and throw an error if the update fails
                console.error("Error updating Firestore document: ", error);
                throw new UploadThingError("Failed to update Firestore");
            }
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
