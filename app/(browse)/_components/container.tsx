"use client";

import { useEffect } from "react";
import { useMediaQuery } from "usehooks-ts";

import { cn } from "@/lib/utils";
import { useSidebar } from "@/store/use-sidebar";

interface ContainerProps {
    children: React.ReactNode;
}

export const Container = ({ children }: ContainerProps) => {
    const matches = useMediaQuery("(max-width: 1024px)");
    const { collapsed, onCollapse, onExpand } = useSidebar((state) => state);

    useEffect(() => {
        matches ? onCollapse() : onExpand();
    }, [matches, onCollapse, onExpand]);

    return (
        <>
            <div
                className={cn(
                    "flex-1 transition-width duration-500 ease-in-out ",
                    collapsed ? "ml-[80px]" : "lg:ml-60"
                )}
            >
                {children}
            </div>
        </>
    );
};
