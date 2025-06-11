import { isUserAnonymous } from '@/lib/actions/user.actions'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

const TopBar = async () => {
	return (
		<nav className='topbar'>
			<Link href='/' className='flex items-center gap-4'>
				<Image src='/assets/logo.svg' alt='logo' width={28} height={28} />
				<p className='text-heading3-bold text-light-1 max-xs:hidden'>
					SeekSupp
				</p>
			</Link>
			<div className='flex items-center gap-5'>
				{/* <div>RU</div> */}
				<div className='block'>
					{(await isUserAnonymous()) ? (
						<Image
							src='/assets/user-dark.svg'
							alt='profile image'
							width={24}
							height={24}
							className='rounded-full'
						/>
					) : (
						<>
							<SignedOut>
								<SignInButton>
									<button className='btn-signin'>Sign In</button>
								</SignInButton>
							</SignedOut>
							<SignedIn>
								<UserButton />
							</SignedIn>
						</>
					)}
				</div>
			</div>
		</nav>
	)
}

export default TopBar
