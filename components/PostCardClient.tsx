'use client'

import { editPost } from '@/lib/actions/post.actions'
import { formatDateString } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import DeletePost from './DeletePost'

interface Props {
	id: string
	text: string
	authorId: string
	currentUser: string
	createdAt: string
	anonym: boolean
	imageUrl: string
	firstName: string
	commentsCount: number
	parentId: string
	editedAt: string
}

const PostCardClient = ({
	id,
	text,
	anonym,
	authorId,
	currentUser,
	createdAt,
	imageUrl,
	firstName,
	commentsCount,
	parentId,
	editedAt,
}: Props) => {
	const [isEditing, setIsEditing] = useState(false)
	const [editedText, setEditedText] = useState(text)
	const router = useRouter()

	const handleSave = async () => {
		if (editedText !== text) {
			editPost(id, editedText)
			router.refresh()
		}
		setIsEditing(false)
	}

	return (
		<article
			className={`flex w-full flex-col rounded-xl  ${
				parentId !== 'no' ? 'px-0 xs:px-7' : 'bg-sidebar p-7'
			}`}
		>
			<div className='flex items-start justify-between'>
				<div className='flex w-full flex-1 flex-row gap-4'>
					<div className='flex flex-col items-center'>
						<Link
							href={!anonym ? `/profile/${authorId}` : `/profile/user`}
							className='relative h-11 w-11'
						>
							<Image
								src={!anonym ? imageUrl : '/assets/user-dark.svg'}
								alt='Profile Image'
								fill
								className='rounded-full'
							/>
						</Link>
						<div className='post-card_bar' />
					</div>

					<div className='flex w-full flex-col'>
						<Link
							href={!anonym ? `/profile/${authorId}` : `/profile/user`}
							className='w-fit'
						>
							<h4 className='text-bold text-gray-500'>
								{!anonym ? firstName : 'User'}
							</h4>
						</Link>

						{isEditing ? (
							<>
								<textarea
									className='mt-2 text-small-regular text-light-2 bg-dark-2 p-2 rounded-md'
									value={editedText}
									onChange={e => setEditedText(e.target.value)}
								/>
								<div className='mt-2 flex gap-2'>
									<button
										onClick={handleSave}
										className='text-sm text-primary cursor-pointer'
									>
										Save
									</button>
									<button
										onClick={() => {
											setIsEditing(false)
											setEditedText(text)
										}}
										className='text-sm text-red-500 cursor-pointer'
									>
										Cancel
									</button>
								</div>
							</>
						) : (
							<p className='mt-2 text-small-regular text-light-2'>{text}</p>
						)}

						<div
							className={`${
								parentId !== 'no' && 'mb-10'
							} mt-5 flex flex-col gat-3`}
						>
							<div className='flex gap-3.5'>
								<Link href={`/posts/${id}`}>
									<Image
										src='/assets/reply.svg'
										alt='reply'
										width={24}
										height={24}
										className='cursor-pointer object-contain'
									/>
								</Link>
							</div>
							<p className='text-xs text-gray-400 mt-2'>
								{editedAt
									? `edited ${formatDateString(editedAt)}`
									: formatDateString(createdAt)}
							</p>
						</div>
					</div>
				</div>
				<div className='flex gap-3'>
					{currentUser === authorId && !isEditing && (
						<Image
							src='/assets/edit.svg'
							alt='edit'
							width={18}
							height={18}
							className='cursor-pointer object-contain'
							onClick={() => setIsEditing(true)}
						/>
					)}
					<DeletePost
						postId={id}
						currentUserId={currentUser}
						authorId={authorId}
						parentId=''
					/>
				</div>
			</div>

			{commentsCount > 0 && (
				<div className='ml-1 mt-3 flex items-center gap-2'>
					<Link href={`/posts/${id}`}>
						<p className='mt-1 text-subtle-medium text-gray-1'>
							{commentsCount} repl{commentsCount > 1 ? 'ies' : 'y'}
						</p>
					</Link>
				</div>
			)}
		</article>
	)
}

export default PostCardClient
