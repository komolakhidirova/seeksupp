'use client'

import { deletePost } from '@/lib/actions/post.actions'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'

interface Props {
	postId: string
	currentUserId: string
	authorId: string
	parentId: string | null
}

function DeletePost({ postId, currentUserId, authorId, parentId }: Props) {
	const pathname = usePathname()
	const router = useRouter()

	if (currentUserId !== authorId || pathname === '/') return null

	return (
		<Image
			src='/assets/delete.svg'
			alt='delete'
			width={18}
			height={18}
			className='cursor-pointer object-contain'
			onClick={async () => {
				await deletePost(postId)
				router.refresh()
			}}
		/>
	)
}

export default DeletePost
