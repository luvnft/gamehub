"use client";

import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Ban, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { onFollow, onUnFollow } from "@/actions/follow";
import { useTransition } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Swal from "sweetalert2";
import { onBlock } from "@/actions/block";
import { getSelf } from "@/lib/auth-service";

interface ActionsProps {
    hostIdentity: string;
    isFollowing: boolean;
    isHost: boolean;
    username: string;
}

export const Actions = ({
    hostIdentity,
    isFollowing,
    isHost,
    username,
}: ActionsProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const { userId } = useAuth();
    const handleFollow = () => {
        startTransition(() => {
            onFollow(hostIdentity)
                .then((data) =>
                    toast.success(
                        `You are now following ${data.following.username}`
                    )
                )
                .catch(() => toast.error("Something went wrong"));
        });
    };

    const handleUnFollow = () => {
        startTransition(() => {
            onUnFollow(hostIdentity)
                .then((data) =>
                    toast.success(
                        `You have unfollowed ${data.following.username}`
                    )
                )
                .catch(() => toast.error("Something went wrong"));
        });
    };

    const toggleFollow = () => {
        if (!userId) return router.push("sign-in");
        if (isHost) return;

        isFollowing ? handleUnFollow() : handleFollow();
    };

    const handleBlock = async () => {
        Swal.fire({
            title: "Are you sure?",
            text: `Do you really want to block ${username}?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            color: "#ffffff",
            confirmButtonText: "Yes, block it!",
            background: "#1f2128",
        }).then((result) => {
            if (result.isConfirmed) {
                startTransition(() => {
                    onBlock(hostIdentity)
                        .then(() => {
                            Swal.fire({
                                title: "Blocked!",
                                text: `${username} has been blocked`,
                                icon: "success",
                                background: "#1f2128",
                                color: "#ffffff",
                            });
                            router.push("/");
                        })
                        .catch(() => toast.error("Something went wrong"));
                });
            }
        });
    };

    return (
        <>
            {userId && !isHost && (
                <Button
                    onClick={handleBlock}
                    variant="destructive"
                    disabled={isPending}
                    className="w-full lg:w-auto"
                >
                    <Ban className="h-4 w-4 mr-2" />
                    Block
                </Button>
            )}

            <Button
                disabled={isPending || isHost}
                onClick={toggleFollow}
                variant="primary"
                size="sm"
                className="w-full lg:w-auto"
            >
                <Heart
                    className={cn(
                        "h-4 w-4 mr-2",
                        isFollowing ? "fill-white" : "fill-none"
                    )}
                />
                {isFollowing ? "Unfollow" : "Follow"}
            </Button>
        </>
    );
};

export const ActionsSkeleton = () => {
    return (
        <>
            <Skeleton className="h-10 w-full lg:w-24" />
            <Skeleton className="h-10 w-full lg:w-24" />
        </>
    );
};
