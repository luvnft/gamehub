"use client";

import { useState, useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";
import { cn } from "@/lib/utils";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";

interface ContainerProps {
    children: React.ReactNode;
}

export const Container = ({ children }: ContainerProps) => {
    const { collapsed, onCollapse, onExpand } = useCreatorSidebar(
        (state) => state
    );

    const matches = useMediaQuery(`(max-width: 1024px)`);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        matches ? onCollapse() : onExpand();
        setIsClient(true);
    }, [matches, onCollapse, onExpand]);

    if (!isClient) {
        return null; // or a loading spinner, or some placeholder content
    }

    return (
        <div
            className={cn(
                "flex-1 transition-width duration-500 ease-in-out",
                collapsed ? "ml-[70px]" : "ml-[70px] lg:ml-60"
            )}
        >
            {children}
        </div>
    );
};
