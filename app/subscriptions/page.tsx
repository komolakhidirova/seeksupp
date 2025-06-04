import PostCard from '@/components/PostCard'
import { getSubscriptionPosts } from '@/lib/actions/post.actions'
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const Page = async () => {
	const user = await currentUser()
	if (!user) redirect('/sign-in')

	const posts = await getSubscriptionPosts(user.id)

	return (
		<main>
			<h1>Subscriptions</h1>
			<section className='mt-9 flex flex-col gap-10'>
				{posts.map(post => (
					<PostCard key={post.id} {...post} authorId={post.author} />
				))}
			</section>
		</main>
	)
}

export default Page
