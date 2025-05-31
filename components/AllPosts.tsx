import { getAllPosts } from '@/lib/actions/post.actions'
import PostCard from './PostCard'

const AllPosts = async () => {
	const posts = await getAllPosts({ limit: 10 })

	return (
		<section className='mt-9 flex flex-col gap-10'>
			{posts.map(post => (
				<PostCard key={post.id} {...post} authorId={post.author} />
			))}
		</section>
	)
}

export default AllPosts
