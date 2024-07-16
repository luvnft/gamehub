import { firestore } from "@/lib/firebaseConfig";
import {
    collection,
    query,
    getDocs,
    where,
    limit,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";

import { getSelf } from "./auth-service";
import { getUserById } from "./user-service";

import { IUser } from "@/app/models/IUser";
import { IBlock } from "@/app/models/IBlock";

export const isBlockedByUser = async (id: string) => {
    try {
        const self = await getSelf();
        const otherUser = await getUserById(id);
        if (otherUser.id == self.id) {
            return false;
        }
        const blockCollection = collection(firestore, "blocks");
        const blockquery = query(
            blockCollection,
            where("blockedId", "==", self.id),
            where("blockerId", "==", otherUser.id)
        );

        const blockQuerySnapshot = await getDocs(blockquery);

        // There should only be one block document matching the criteria
        const existingBlock = blockQuerySnapshot.docs[0];

        return !!existingBlock;
    } catch (error) {
        return false;
    }
};

export const isInBlockedList = async (id: string) => {
    try {
        const self = (await getSelf()) as IUser;

        const otherUser = await getUserById(id);

        if (otherUser.id == self.id) {
            return false;
        }

        const isInBlockedList = self.blocking?.find(
            (user) => user.id === otherUser.id
        );

        return !!isInBlockedList;
    } catch (error) {
        return false;
    }
};

export const blockUser = async (id: string): Promise<IBlock> => {
    try {
        const self = (await getSelf()) as IUser;

        if (self.id === id) {
            throw new Error("Cannot block yourself");
        }

        const otherUser = await getUserById(id);

        const blocksCollection = collection(firestore, "blocks");
        const existingBlockQuery = query(
            blocksCollection,
            where("blockerId", "==", self.id),
            where("blockedId", "==", otherUser.id),
            limit(1)
        );
        const existingBlockSnapshot = await getDocs(existingBlockQuery);

        if (!existingBlockSnapshot.empty) {
            throw new Error("Already blocked");
        }

        const blockToAdd: IBlock = {
            blockerId: self.id!,
            blockedId: otherUser.id!,
            blocker: self,
            blocked: otherUser,
        };

        const blockRef = await addDoc(blocksCollection, blockToAdd);

        // Update db users adding the block
        const updatedSelf = {
            ...self,
            blocking: self.blocking
                ? [...self.blocking, blockToAdd.blocked]
                : [blockToAdd.blocked],
        };

        const updatedOtherUser = {
            ...otherUser,
            blockedBy: otherUser.blockedBy
                ? [...otherUser.blockedBy, blockToAdd.blocker]
                : [blockToAdd.blocker],
        };

        await updateDoc(doc(firestore, "users", self.id!), updatedSelf);
        await updateDoc(
            doc(firestore, "users", otherUser.id!),
            updatedOtherUser
        );

        return {
            id: blockRef.id,
            ...blockToAdd,
        };
    } catch (error) {
        console.error("Error blocking user:", error);
        throw new Error("Failed to block user");
    }
};

export const unblockUser = async (id: string): Promise<IBlock> => {
    try {
        const self = (await getSelf()) as IUser;

        const otherUser = await getUserById(id);

        const blocksCollection = collection(firestore, "blocks");
        const existingBlockQuery = query(
            blocksCollection,
            where("blockerId", "==", self.id),
            where("blockedId", "==", otherUser.id),
            limit(1)
        );
        const existingBlockSnapshot = await getDocs(existingBlockQuery);

        if (existingBlockSnapshot.empty) {
            throw new Error("Block record not found");
        }

        // Get document block id
        const blockId = existingBlockSnapshot.docs[0].id;

        // Delete document block
        await deleteDoc(doc(firestore, "blocks", blockId));

        // Update users documents in firestore to show unblock
        const updatedSelf = {
            ...self,
            blocking: self.blocking
                ? self.blocking.filter((b) => b.id !== otherUser.id)
                : [],
        };

        const updatedOtherUser = {
            ...otherUser,
            blockedBy: otherUser.blockedBy
                ? otherUser.blockedBy.filter((b) => b.id !== self.id)
                : [],
        };

        await updateDoc(doc(firestore, "users", self.id!), updatedSelf);
        await updateDoc(
            doc(firestore, "users", otherUser.id!),
            updatedOtherUser
        );

        // Build object IBlock to return.
        const unblockedBlock: IBlock = {
            id: blockId,
            blockerId: self.id!,
            blockedId: otherUser.id!,
            blocker: {
                id: self.id!,
                username: self.username,
                imageUrl: self.imageUrl,
                externalUserId: self.externalUserId,
                bio: self.bio,
                createdAt: self.createdAt,
                updatedAt: self.updatedAt,
            },
            blocked: {
                id: otherUser.id!,
                username: otherUser.username,
                imageUrl: otherUser.imageUrl,
                externalUserId: otherUser.externalUserId,
                bio: otherUser.bio,
                createdAt: otherUser.createdAt,
                updatedAt: otherUser.updatedAt,
            },
        };

        return unblockedBlock;
    } catch (error) {
        console.error("Error unblocking user:", error);
        throw new Error("Failed to unblock user");
    }
};
