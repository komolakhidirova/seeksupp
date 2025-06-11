import {
	checkLike,
	getComments,
	getLikesCount,
} from '@/lib/actions/post.actions'
import { getUserById } from '@/lib/actions/user.actions'
import PostCardClient from './PostCardClient'

interface Props {
	id: string
	text: string
	authorId: string
	currentUser: string
	created_at: string
	anonym: boolean
	parent_id: string
	edited_at: string
}

const PostCard = async ({
	id,
	text,
	anonym,
	authorId,
	currentUser,
	created_at,
	parent_id,
	edited_at,
}: Props) => {
	const { firstName, imageUrl } = await getUserById(authorId)
	const comments = await getComments(id)

	const [initialIsLiked, initialLikesCount] = await Promise.all([
		checkLike(id, currentUser),
		getLikesCount(id),
	])

	return (
		<PostCardClient
			id={id}
			text={text}
			anonym={anonym}
			authorId={authorId}
			currentUser={currentUser}
			createdAt={created_at}
			imageUrl={imageUrl}
			firstName={firstName!}
			commentsCount={comments?.length || 0}
			parentId={parent_id}
			editedAt={edited_at}
			initialLikesCount={initialLikesCount}
			initialIsLiked={initialIsLiked}
		/>
	)
}

export default PostCard
