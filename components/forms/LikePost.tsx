'use client'

import { likePost, unlikePost } from '@/lib/actions/post.actions'
import Image from 'next/image'
import { useState } from 'react'

interface Props {
	id: string
	initialIsLiked: boolean
	initialLikesCount: number
	currentUser: string
}

const LikePost = ({
	id,
	initialIsLiked,
	initialLikesCount,
	currentUser,
}: Props) => {
	const [isLiked, setIsLiked] = useState(initialIsLiked)
	const [likesCount, setLikesCount] = useState(initialLikesCount)

	const handleLike = async () => {
		try {
			if (isLiked) {
				await unlikePost(id, currentUser)
				setLikesCount(prev => prev - 1)
			} else {
				await likePost(id, currentUser)
				setLikesCount(prev => prev + 1)
			}
			setIsLiked(!isLiked)
		} catch (error) {
			console.error('Error updating like:', error)
		}
	}

	return (
		<div className='flex items-center gap-1'>
			<Image
				src={isLiked ? '/assets/heart-filled.svg' : '/assets/heart.svg'}
				alt='heart'
				width={24}
				height={24}
				className='cursor-pointer object-contain'
				onClick={handleLike}
			/>
			<span className='text-small-regular text-light-2'>{likesCount}</span>
		</div>
	)
}

export default LikePost
