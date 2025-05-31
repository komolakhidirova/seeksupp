import PostCard from '@/components/PostCard'
import { getAllPosts } from '@/lib/actions/post.actions'

export const dynamic = 'force-dynamic'

const Page = async () => {
	const posts = await getAllPosts()

	return (
		<main>
			<h1>Forum</h1>
			<section className='mt-9 flex flex-col gap-10'>
				{posts.map(post => (
					<PostCard key={post.id} {...post} authorId={post.author} />
				))}
			</section>
		</main>
	)
}

export default Page
