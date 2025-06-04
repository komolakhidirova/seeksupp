import { getActivity } from '@/lib/actions/post.actions'
import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const Page = async () => {
	const user = await currentUser()
	if (!user) redirect('/sign-in')

	const activity = await getActivity(user.id)

	return (
		<section>
			<h1>Activity</h1>
			<section className='mt-10 flex flex-col gap-5'>
				{activity.length > 0 ? (
					<>
						{activity.map(item => (
							<Link
								key={item.id}
								href={
									item.type === 'reply'
										? `/posts/${item.parent_id}`
										: `/posts/${item.post_id}`
								}
							>
								<article className='activity-card flex items-center gap-3'>
									<Image
										src={
											item.type === 'reply'
												? !item.anonym
													? item.author.image
													: '/assets/user-dark.svg'
												: item.author.image
										}
										alt='Profile Picture'
										width={20}
										height={20}
										className='rounded-full object-cover'
									/>
									<p className='!text-small-regular text-light-1'>
										<span className='mr-1 text-primary'>
											{item.type === 'reply'
												? !item.anonym
													? item.author.name
													: 'User'
												: item.author.name}
										</span>{' '}
										{item.type === 'reply'
											? 'replied to your post'
											: 'liked your post'}
									</p>
								</article>
							</Link>
						))}
					</>
				) : (
					<p className='!text-base-regular text-light-3'>No activity yet</p>
				)}
			</section>
		</section>
	)
}

export default Page
