import PostCard from '@/components/cards/PostCard'
import { getUserPosts } from '@/lib/actions/post.actions'
import { switchAccount } from '@/lib/actions/user.actions'
import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function Page() {
	const user = await currentUser()
	if (!user) redirect('/sign-in')

	const posts = await getUserPosts(user.id)
	const isAnon = Boolean(user.publicMetadata?.isAnon)

	return (
		<main className='min-lg:w-3/4'>
			<h1>My Account</h1>

			<section className='flex justify-between gap-4 max-sm:flex-col items-center mt-9'>
				<div className='flex gap-4 items-center'>
					<Image
						src={isAnon ? '/assets/user-dark.svg' : user.imageUrl}
						alt='profile image'
						width={110}
						height={110}
						className='rounded-full'
					/>
					<div className='flex flex-col gap-2'>
						<h1 className='font-bold text-2xl'>
							{isAnon
								? 'User'
								: `${user.firstName || ''} ${user.lastName || ''}`}
						</h1>
						<p className='text-sm text-muted-foreground'>
							{user.emailAddresses?.[0]?.emailAddress}
						</p>
					</div>
				</div>

				<form action={switchAccount}>
					<button
						type='submit'
						className='px-4 py-2 bg-primary text-white rounded cursor-pointer'
					>
						{isAnon ? 'My Account' : 'Anonym Account'}
					</button>
				</form>
			</section>

			<section className='mt-9 flex flex-col gap-10'>
				{posts.map(post => (
					<PostCard
						key={post.id}
						{...post}
						authorId={post.author}
						currentUser={user.id}
					/>
				))}
			</section>
		</main>
	)
}
