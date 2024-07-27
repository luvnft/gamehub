"use client";

import { onBlock, onUnBlock } from "@/actions/block";
import { onFollow, onUnFollow } from "@/actions/follow";

import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

interface ActionsProps {
    isFollowing: boolean;
    isInMyBlockedList: boolean;
    userId: string;
}

export const Actions = ({
    isFollowing,
    isInMyBlockedList,
    userId,
}: ActionsProps) => {
    const [isPending, startTransition] = useTransition();

    const handleFollow = () => {
        startTransition(() => {
            onFollow(userId)
                .then((data) =>
                    toast.success(
                        `You are now following ${data.following?.username}`
                    )
                )
                .catch(() => toast.error("Something went wrong"));
        });
    };

    const handleUnFollow = () => {
        startTransition(() => {
            onUnFollow(userId)
                .then((data) =>
                    toast.success(
                        `You are have unfollowed ${data.following?.username}`
                    )
                )
                .catch(() => toast.error("Something went wrong"));
        });
    };

    const handleBlock = () => {
        startTransition(() => {
            onBlock(userId)
                .then((data) =>
                    toast.success(`Blocked the user ${data!.blocked.username}`)
                )
                .catch(() => toast.error("Something went wrong"));
        });
    };

    const handleUnBlock = () => {
        startTransition(() => {
            onUnBlock(userId)
                .then((data) =>
                    toast.success(`Unblocked the user ${data.blocked.username}`)
                )
                .catch(() => toast.error("Something went wrong"));
        });
    };

    const onClickFollow = () =>
        isFollowing ? handleUnFollow() : handleFollow();

    const onClickBlock = () =>
        isInMyBlockedList ? handleUnBlock() : handleBlock();
    return (
        <>
            <Button
                disabled={isPending}
                onClick={onClickFollow}
                variant="primary"
            >
                {isFollowing ? "Unfollow" : "Follow"}
            </Button>
            <Button onClick={onClickBlock} disabled={isPending}>
                {isInMyBlockedList ? "Unblock" : "Block"}
            </Button>
        </>
    );
};
