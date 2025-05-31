import PostCard from '@/components/PostCard'
import { getUserPosts } from '@/lib/actions/post.actions'
import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'

const Page = async () => {
	const user = await currentUser()
	if (!user) redirect('/sign-in')

	const posts = await getUserPosts(user.id)

	return (
		<main className='min-lg:w-3/4'>
			<h1>My Account</h1>
			<section className='flex justify-between gap-4 max-sm:flex-col items-center mt-9'>
				<div className='flex gap-4 items-center'>
					<Image
						src={user.imageUrl}
						alt={user.firstName!}
						width={110}
						height={110}
						className='rounded-full'
					/>
					<div className='flex flex-col gap-2'>
						<h1 className='font-bold text-2xl'>
							{user.firstName} {user.lastName}
						</h1>
						<p className='text-sm text-muted-foreground'>
							{user.emailAddresses[0].emailAddress}
						</p>
					</div>
				</div>
			</section>
			<section className='mt-9 flex flex-col gap-10'>
				{posts.map(post => (
					<PostCard key={post.id} {...post} authorId={post.author} />
				))}
			</section>
		</main>
	)
}

export default Page
