"use client";
import React, { useState, useEffect } from "react";
import { useSidebar } from "@/store/use-sidebar";
import { cn } from "@/lib/utils";
import { useIsClient } from "usehooks-ts";
import { ToggleSkeleton } from "./Toggle";
import { RecommendedSkeleton } from "./recommended";
import { FollowingSkeleton } from "./following";

interface WrapperProps {
    children: React.ReactNode;
}

export const Wrapper = ({ children }: WrapperProps) => {
    const isClient = useIsClient();
    const { collapsed } = useSidebar((state) => state);
    const [showChildren, setShowChildren] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowChildren(true);
        }, 250);

        return () => {
            clearTimeout(timer);
            setShowChildren(false); // Reset visibility when collapsed changes
        };
    }, [collapsed]);

    if (!isClient) {
        return (
            <aside className="fixed left-0 flex flex-col w-[70px] lg:w-60 h-full bg-background border-r border-[#2D2E35] z-50">
                <ToggleSkeleton />
                <FollowingSkeleton />
                <RecommendedSkeleton />
            </aside>
        );
    }

    return (
        <aside
            className={cn(
                "fixed left-0 flex flex-col h-full bg-background border-r border-[#2D2E35] z-50",
                collapsed ? "w-[70px]" : "w-60",
                "transition-width duration-500 ease-in-out"
            )}
        >
            <div className="overflow-y-auto transition-opacity">
                {showChildren && children}
            </div>
        </aside>
    );
};
