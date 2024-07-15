"use server";

import { blockUser, unblockUser } from "@/lib/block-service";
import { revalidatePath } from "next/cache";

export const onBlock = async (id: string) => {
    // TODO: Adapt to disconnect from livestream.
    // TODO: Allow ability to kick the guest.

    const blockedUser = await blockUser(id);

    if (blockedUser) {
        revalidatePath(`/${blockedUser.blocked.username}`);
    }

    return blockedUser;
};

export const onUnBlock = async (id: string) => {
    const unBlockedUser = await unblockUser(id);

    if (unBlockedUser) {
        revalidatePath(`/${unBlockedUser.blocked.username}`);
    }

    return unBlockedUser;
};
