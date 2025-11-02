

import React, { createContext, useContext, useState, ReactNode } from "react";

type SidebarContextType = {
	isOpen: boolean;
	toggleSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false);
	const toggleSidebar = () => setIsOpen((v) => !v);
	return (
		<SidebarContext.Provider value={{ isOpen, toggleSidebar }}>
			{children}
		</SidebarContext.Provider>
	);
};

export function useSidebar() {
	const ctx = useContext(SidebarContext);
	if (!ctx) throw new Error("useSidebar must be used within SidebarProvider");
	return ctx;
}

export function Sidebar({ children }: { children: ReactNode }) {
	const { isOpen } = useSidebar();
	return isOpen ? <aside>{children}</aside> : null;
}


