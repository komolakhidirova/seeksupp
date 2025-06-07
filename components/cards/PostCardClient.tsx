'use client'

import { formatDateString } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import DeletePost from '../forms/DeletePost'
import EditPost from '../forms/EditPost'
import LikePost from '../forms/LikePost'
import ReportPost from '../forms/ReportPost'

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
	initialLikesCount: number
	initialIsLiked: boolean
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
	initialLikesCount,
	initialIsLiked,
}: Props) => {
	const [isEditing, setIsEditing] = useState(false)

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
							<EditPost
								id={id}
								initialText={text}
								onCancel={() => setIsEditing(false)}
							/>
						) : (
							<p className='mt-2 text-small-regular text-light-2'>{text}</p>
						)}

						<div
							className={`$${
								parentId !== 'no' && 'mb-10'
							} mt-5 flex flex-col gap-3`}
						>
							<div className='flex gap-3.5 relative'>
								<LikePost
									id={id}
									initialIsLiked={initialIsLiked}
									initialLikesCount={initialLikesCount}
								/>

								<Link href={`/posts/${id}`}>
									<Image
										src='/assets/reply.svg'
										alt='reply'
										width={24}
										height={24}
										className='cursor-pointer object-contain'
									/>
								</Link>

								<ReportPost id={id} />
							</div>
							<p className='text-xs text-gray-400 mt-2'>
								{editedAt
									? `edited ${formatDateString(editedAt)}`
									: formatDateString(createdAt)}
							</p>
						</div>
					</div>
				</div>

				<div className='flex gap-3 relative'>
					{currentUser === authorId && !isEditing && (
						<>
							<Image
								src='/assets/edit.svg'
								alt='edit'
								width={18}
								height={18}
								className='cursor-pointer object-contain'
								onClick={() => setIsEditing(true)}
							/>
							<DeletePost id={id} />
						</>
					)}
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
