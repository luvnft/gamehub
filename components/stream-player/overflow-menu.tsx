import React, { useState } from "react";
import { Menu, MenuItem, IconButton } from "@mui/material";
import clsx from "clsx";

interface OverflowMenuProps {
    menuItems: {
        Icon?: React.ElementType;
        label: string;
        onClick: () => void;
        bgColor?: string;
    }[];
    disabled?: boolean;
    iconMenu: React.ElementType;
}

const OverflowMenu = ({
    menuItems,
    iconMenu: IconMenu,
    disabled,
}: OverflowMenuProps) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleClickMenuItem = (onClick: () => void) => () => {
        onClick();
        handleClose();
    };

    return (
        <div>
            <IconButton
                aria-controls="simple-menu"
                aria-haspopup="true"
                onClick={handleClick}
                color="primary"
                className={clsx({
                    "opacity-50 cursor-default": disabled,
                })}
                disabled={disabled}
                sx={{
                    "&.Mui-disabled": {
                        bgcolor: "transparent",
                        color: disabled ? "#1976d2" : "inherit",
                    },
                }}
            >
                <IconMenu
                    className={clsx({
                        "cursor-default": disabled,
                    })}
                />
            </IconButton>

            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        sx: {
                            backgroundColor: "#1f2128",
                        },
                    },
                }}
            >
                {menuItems.map(({ Icon, label, onClick, bgColor }, index) => (
                    <MenuItem
                        key={index}
                        disabled={disabled}
                        onClick={handleClickMenuItem(onClick)}
                        sx={{
                            color: "#FFF5EA",
                            fontSize: "14px",
                            opacity: 0.9,
                            borderRadius: "8px",
                            transition: "background-color 0.3s, opacity 0.3s",
                            "&:hover": {
                                backgroundColor: bgColor,
                                color: "#FFFFFF",
                                opacity: 0.8,
                            },
                        }}
                    >
                        {Icon && <Icon className="h-4 w-4 mr-2" />}

                        {label}
                    </MenuItem>
                ))}
            </Menu>
        </div>
    );
};

export default OverflowMenu;
