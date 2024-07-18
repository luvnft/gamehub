"use client";

import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { useCreatorSidebar } from "@/store/use-creator-sidebar";
import { ArrowLeftFromLine, ArrowRightFromLine } from "lucide-react";
import { useState, useEffect } from "react";

export const Toggle = () => {
    const { collapsed, onExpand, onCollapse } = useCreatorSidebar(
        (state) => state
    );

    const label = collapsed ? "Expand" : "Collapse";
    const [showDashboard, setShowDashboard] = useState(false);
    const [showArrows, setShowArrows] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setShowArrows(true);
        }, 300);
        setShowArrows(false);
    }, [collapsed]);

    useEffect(() => {
        if (!collapsed) {
            const timer = setTimeout(() => {
                setShowDashboard(true);
            }, 300);

            return () => clearTimeout(timer);
        } else {
            setShowDashboard(false);
        }
    }, [collapsed]);

    return (
        <>
            {collapsed && (
                <div className="w-full hidden lg:flex items-center justify-center pt-4 mb-4">
                    <Hint label={label} side="right" asChild>
                        <Button
                            onClick={onExpand}
                            variant="ghost"
                            className={`h-auto p-2 transition-opacity duration-300 ease-in-out ${
                                showArrows ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <ArrowRightFromLine className="h-4 w-4" />
                        </Button>
                    </Hint>
                </div>
            )}
            {!collapsed && (
                <div className="p-3 pl-6 mb-2 hidden lg:flex items-center w-full">
                    <p
                        className={`font-semibold text-primary transition-opacity duration-300 ease-in-out ${
                            showDashboard ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        Dashboard
                    </p>
                    <Hint label={label} side="right" asChild>
                        <Button
                            onClick={onCollapse}
                            variant="ghost"
                            className={`h-auto p-2 ml-auto transition-opacity duration-300 ease-in-out ${
                                showArrows ? "opacity-100" : "opacity-0"
                            }`}
                        >
                            <ArrowLeftFromLine className="h-4 w-4" />
                        </Button>
                    </Hint>
                </div>
            )}
        </>
    );
};
