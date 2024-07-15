"use server";

import { revalidatePath } from "next/cache";
import { followUser, unFollowUser } from "@/lib/follow-service";

export const onFollow = async (id: string) => {
    try {
        const followedUser = await followUser(id);
        revalidatePath("/");

        if (followedUser && followedUser.following) {
            revalidatePath(`/${followedUser.following.username}`);
        }

        return followedUser;
    } catch (error) {
        console.error(error);

        throw new Error("Internal Error");
    }
};

export const onUnFollow = async (id: string) => {
    try {
        const unFollowedUser = await unFollowUser(id);
        revalidatePath("/");

        if (unFollowedUser && unFollowedUser.following) {
            revalidatePath(`/${unFollowedUser.following.username}`);
        }

        return unFollowedUser;
    } catch (error) {
        console.error(error);

        throw new Error("Internal Error");
    }
};
