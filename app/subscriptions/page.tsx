import PostCard from '@/components/cards/PostCard'
import { getSubscriptionPosts } from '@/lib/actions/post.actions'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const Page = async () => {
	const user = await currentUser()
	if (!user) redirect('/sign-in')

	const posts = await getSubscriptionPosts(user.id)

	return (
		<main>
			<div className='flex gap-5 items-end'>
				<h1>Subscriptions</h1>
				<Link href='/'>
					<h2 className='text-xl text-gray-500'>Forum</h2>
				</Link>
			</div>
			<section className='mt-9 flex flex-col gap-10'>
				{posts.map(post => (
					<PostCard key={post.id} {...post} authorId={post.author} />
				))}
			</section>
		</main>
	)
}

export default Page
