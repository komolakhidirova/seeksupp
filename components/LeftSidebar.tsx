'use client'

// import { useAuth } from '@clerk/nextjs'
import { sidebarLinks } from '@/constants'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

function LeftSidebar() {
	const router = useRouter()
	const pathname = usePathname()
	// const { userId } = useAuth()

	return (
		<section className='custom-scrollbar leftsidebar'>
			<div className='flex w-full flex-1 flex-col gap-6 px-6'>
				{sidebarLinks.map(link => {
					const isActive =
						(pathname.includes(link.route) && link.route.length > 1) ||
						pathname == link.route

					// if (link.route === '/profile')
					// 	userId
					// 		? (link.route = `${link.route}/${userId}`)
					// 		: (link.route = '/profile')

					if (link.route === '/profile') link.route = `${link.route}/1`

					return (
						<Link
							href={link.route}
							key={link.label}
							className={`leftsidebar_link ${
								isActive && 'bg-primary text-white'
							}`}
						>
							<Image
								src={isActive ? link.imgURL! : link.imgURLDark!}
								alt={link.label}
								width={24}
								height={24}
							/>
							<p className='text-light-1 max-lg:hidden'>{link.label}</p>
						</Link>
					)
				})}
			</div>
		</section>
	)
}

export default LeftSidebar
