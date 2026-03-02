import { NavTabItem } from '@/types/general';
import { Link } from '@tanstack/react-router';
import React from 'react';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

type TabNavProps = {
    currentPathname: string;
    customMobileName?: string;
    navItems: NavTabItem[];
};

export const TabNav: React.FC<TabNavProps> = ({ currentPathname, navItems }) => {
    const id = React.useId();
    const [open, setOpen] = React.useState(false);

    const currentNavItem = navItems.find((item) => item.pathname === currentPathname);

    return (
        <React.Fragment>
            <NavigationMenu className="hidden md:flex gap-4">
                <NavigationMenuList>
                    {navItems.map(({ label, path, params, search, pathname, disabled, badge, hide }, index) =>
                        hide ? null : (
                            <NavigationMenuItem key={`navigation-menu-item-${id}-${index}`}>
                                <NavigationMenuLink
                                    active={currentPathname === pathname}
                                    className={navigationMenuTriggerStyle()}
                                    asChild
                                >
                                    <Link
                                        to={path}
                                        params={params}
                                        search={search}
                                        disabled={disabled}
                                        className="flex gap-2 items-center"
                                    >
                                        {label}
                                        {disabled && badge && (
                                            <span className="text-xs px-2 py-0.5 rounded bg-muted">{badge}</span>
                                        )}
                                    </Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>
                        ),
                    )}
                </NavigationMenuList>
            </NavigationMenu>

            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        className="hover:bg-accent hover:text-accent-foreground md:hidden"
                        size="sm"
                        variant="ghost"
                    >
                        <Menu /> {currentNavItem?.label}
                    </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-2">
                    <NavigationMenu className="max-w-none">
                        <NavigationMenuList className="flex-col items-start gap-1">
                            {navItems.map(({ label, path, params, search, pathname, disabled, badge, hide }, index) =>
                                hide ? null : (
                                    <NavigationMenuItem key={`navigation-menu-item-${id}-${index}-mobile`}>
                                        <NavigationMenuLink
                                            active={currentPathname === pathname}
                                            className={navigationMenuTriggerStyle()}
                                            asChild
                                        >
                                            <Link
                                                to={path}
                                                params={params}
                                                search={search}
                                                disabled={disabled}
                                                className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer no-underline"
                                            >
                                                {label}
                                                {disabled && badge && (
                                                    <span className="text-xs px-2 py-0.5 rounded bg-muted">
                                                        {badge}
                                                    </span>
                                                )}
                                            </Link>
                                        </NavigationMenuLink>
                                    </NavigationMenuItem>
                                ),
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>
                </PopoverContent>
            </Popover>
        </React.Fragment>
    );
};
