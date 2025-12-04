import "~/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import Layout from "~/components/layout/Layout";

export const metadata: Metadata = {
	title: "MJ Media - Retro Gaming Portfolio",
	description: "Full-stack developer passionate about pixel art and modern web technologies",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${geist.variable}`}>
			<body>
				<TRPCReactProvider>
					<Layout>{children}</Layout>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
