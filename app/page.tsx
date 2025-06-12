import PostCard from '@/components/cards/PostCard'
import { getAllPosts } from '@/lib/actions/post.actions'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const Page = async () => {
	const posts = await getAllPosts()
	const user = await currentUser()

	return (
		<main>
			<div className='flex gap-5 items-end'>
				<h1>Forum</h1>
				<Link href='/subscriptions'>
					<h2 className='text-xl text-gray-500'>Subscriptions</h2>
				</Link>
			</div>
			<section className='mt-9 flex flex-col gap-10'>
				{posts.map(post => (
					<PostCard
						key={post.id}
						{...post}
						authorId={post.author}
						currentUser={user?.id}
					/>
				))}
			</section>
		</main>
	)
}

export default Page
