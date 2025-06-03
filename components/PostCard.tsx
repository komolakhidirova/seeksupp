// import { formatDateString } from '@/lib/utils'
import { getComments, getUserById } from '@/lib/actions/post.actions'
import Image from 'next/image'
import Link from 'next/link'
import DeletePost from './DeletePost'
// import DeleteThread from '../forms/DeleteThread'

interface Props {
	id: string
	text: string
	authorId: string
	currentUser: string
	createdAt: string
	anonym: boolean
}

const PostCard = async ({
	id,
	text,
	anonym,
	authorId,
	currentUser,
	createdAt,
}: Props) => {
	const { firstName, imageUrl } = await getUserById(authorId)
	const comments = await getComments(id)

	return (
		<article className='flex w-full flex-col rounded-xl bg-sidebar p-7'>
			<div className='flex items-start justify-between'>
				<div className='flex w-full flex-1 flex-row gap-4'>
					<div className='flex flex-col items-center'>
						{/* <Link href={`/profile/${author.id}`} className='relative h-11 w-11'> */}
						<div className='relative h-11 w-11'>
							<Image
								src={!anonym ? imageUrl : '/assets/user-dark.svg'}
								alt='Profile Image'
								fill
								className='rounded-full'
							/>
						</div>
						<div className='post-card_bar' />
					</div>

					<div className='flex w-full flex-col'>
						<div className='w-fit'>
							<h4 className='text-bold text-gray-500'>
								{!anonym ? firstName : 'User'}
							</h4>
						</div>

						<p className='mt-2 text-small-regular text-light-2'>{text}</p>

						<div className=' mt-5 flex flex-col gat-3'>
							<div className='flex gap-3.5'>
								{/* <Image
									src='/assets/heart-gray.svg'
									alt='heart'
									width={24}
									height={24}
									className='cursor-pointer object-contain'
								/> */}
								<Link href={`/posts/${id}`}>
									<Image
										src='/assets/reply.svg'
										alt='reply'
										width={24}
										height={24}
										className='cursor-pointer object-contain'
									/>
								</Link>
								{/* <Image
									src='/assets/repost.svg'
									alt='repost'
									width={24}
									height={24}
									className='cursor-pointer object-contain'
								/>
								<Image
									src='/assets/share.svg'
									alt='share'
									width={24}
									height={24}
									className='cursor-pointer object-contain'
								/> */}
							</div>
						</div>
					</div>
				</div>

				<DeletePost
					postId={id}
					currentUserId={currentUser}
					authorId={authorId}
					parentId=''
				/>
			</div>

			{comments?.length! > 0 && (
				<div className='ml-1 mt-3 flex items-center gap-2'>
					<Link href={`/posts/${id}`}>
						<p className='mt-1 text-subtle-medium text-gray-1'>
							{comments?.length} repl{comments?.length! > 1 ? 'ies' : 'y'}
						</p>
					</Link>
				</div>
			)}
		</article>
	)
}

export default PostCard
