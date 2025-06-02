import Comment from '@/components/Comment'
import PostCard from '@/components/PostCard'
import { getComments, getPostById } from '@/lib/actions/post.actions'

interface PostSessionPageProps {
	params: Promise<{ id: string }>
}

const Page = async ({ params }: PostSessionPageProps) => {
	const { id } = await params
	const post = await getPostById(id)
	const comments = await getComments(id)

	return (
		<section className='relative '>
			<div>
				<PostCard key={post.id} {...post} authorId={post.author} />
			</div>
			<div className='mt-7 '>
				<Comment parentId={id} />
			</div>
			<div className='mt-10'>
				{/* @ts-ignore */}
				{comments.map(comment => (
					<PostCard key={comment.id} {...comment} authorId={comment.author} />
				))}
			</div>
		</section>
	)
}

export default Page
