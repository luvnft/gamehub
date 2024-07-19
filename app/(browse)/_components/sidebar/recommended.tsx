"use client";
import { IUser } from "@/app/models/IUser";
import { useSidebar } from "@/store/use-sidebar";
import { UserItem, UserItemSkeleton } from "./user-item";
import { useEffect, useState } from "react";
import { FollowingIcon } from "@/components/ui/following";
import { RecommendedIcon } from "@/components/ui/recommended";

interface RecommendedProps {
    data: IUser[];
}

export const Recommended = ({ data }: RecommendedProps) => {
    const { collapsed } = useSidebar((state) => state);
    const [showLabel, setShowLabel] = useState(false);

    useEffect(() => {
        if (!collapsed) {
            const timer = setTimeout(() => {
                setShowLabel(true);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setShowLabel(false); // Reset visibility when collapsed
        }
    }, [collapsed]);

    return (
        <div>
            <div className="flex items-center pl-6 mb-4">
                <div className="pl-1">
                    <RecommendedIcon />
                </div>
                <p
                    className={`ml-3 mt-1 text-sm text-muted-foreground transition-opacity duration-300 ${
                        showLabel ? "opacity-100" : "opacity-0"
                    }`}
                >
                    Recommended
                </p>
            </div>

            <ul className="space-y-2 px-2">
                {data.map((user) => (
                    <UserItem
                        key={user.id}
                        username={user.username}
                        imageUrl={user.imageUrl}
                        isLive={user.stream?.isLive}
                    />
                ))}
            </ul>
        </div>
    );
};

export const RecommendedSkeleton = () => {
    return (
        <ul className="px-2">
            {[...Array(3)].map((_, i) => (
                <UserItemSkeleton key={i} />
            ))}
        </ul>
    );
};
