// import { formatDateString } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
// import DeleteThread from '../forms/DeleteThread'

interface Props {
	id: string
	text: string
	authorId: string
	createdAt: string
	anonym: boolean
}

const PostCard = async ({ id, text, anonym, authorId, createdAt }: Props) => {
	// @ts-ignore
	const { firstName, imageUrl } = await getUserById(authorId)

	return (
		<article className='flex w-full flex-col rounded-xl bg-sidebar p-7'>
			<div className='flex items-start justify-between'>
				<div className='flex w-full flex-1 flex-row gap-4'>
					<div className='flex flex-col items-center'>
						{/* <Link href={`/profile/${author.id}`} className='relative h-11 w-11'> */}
						<Link href='' className='relative h-11 w-11'>
							<Image
								src={!anonym ? imageUrl : '/assets/user-dark.svg'}
								alt='Profile Image'
								fill
								className='cursor-pointer rounded-full'
							/>
						</Link>
						<div className='post-card_bar' />
					</div>

					<div className='flex w-full flex-col'>
						<Link href='' className='w-fit'>
							<h4 className='cursor-pointer text-bold text-gray-500'>
								{!anonym ? firstName : 'User'}
							</h4>
						</Link>

						<p className='mt-2 text-small-regular text-light-2'>{text}</p>

						<div className=' mt-5 flex flex-col gat-3'>
							<div className='flex gap-3.5'>
								<Image
									src='/assets/heart-gray.svg'
									alt='heart'
									width={24}
									height={24}
									className='cursor-pointer object-contain'
								/>
								<Link href={`/thread/${id}`}>
									<Image
										src='/assets/reply.svg'
										alt='reply'
										width={24}
										height={24}
										className='cursor-pointer object-contain'
									/>
								</Link>
								<Image
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
								/>
							</div>
						</div>
					</div>
				</div>

				{/* <DeleteThread
					threadId={JSON.stringify(id)}
					currentUserId={currentUserId}
					authorId={author.id}
					parentId={parentId}
					isComment={isComment}
				/> */}
			</div>
		</article>
	)
}

export default PostCard
