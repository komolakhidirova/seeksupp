import BottomBar from '@/components/BottomBar'
import LeftSidebar from '@/components/LeftSidebar'
import TopBar from '@/components/TopBar'
import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Bricolage_Grotesque } from 'next/font/google'
import './globals.css'

const bricolage = Bricolage_Grotesque({
	variable: '--font-bricolage',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'SeekSupp',
	description: 'Forum of anonymous people seeking support.',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang='en'>
			<body className={`${bricolage.variable} antialiased`}>
				<ClerkProvider appearance={{ variables: { colorPrimary: '#24ae7c' } }}>
					<TopBar />
					<main className='flex flex-row'>
						<LeftSidebar />
						<section className='main-container'>
							<div className='w-full max-w-4xl'>{children}</div>
						</section>
					</main>
					<BottomBar />
				</ClerkProvider>
			</body>
		</html>
	)
}
