import { getActivity } from '@/lib/actions/post.actions'
import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

const Page = async () => {
	const user = await currentUser()
	if (!user) redirect('/sign-in')

	const activity = await getActivity(user.id)

	const getAuthorImage = (item: any) => {
		if (item.anonym) return '/assets/user-dark.svg'
		return item.author.image
	}

	const getAuthorName = (item: any) => {
		if (item.anonym) return 'User'
		return item.author.name
	}

	const getPostLink = (item: any) =>
		item.type === 'reply'
			? `/posts/${item.parent_id}`
			: `/posts/${item.post_id}`

	const getActivityText = (type: string) => {
		switch (type) {
			case 'reply':
				return 'replied to your post'
			case 'like':
				return 'liked your post'
			case 'report':
				return 'reported your post'
			default:
				return ''
		}
	}

	return (
		<section>
			<h1>Activity</h1>
			<section className='mt-10 flex flex-col gap-5'>
				{activity.length > 0 ? (
					<>
						{activity.map(item => (
							<Link key={item.id} href={getPostLink(item)}>
								<article className='activity-card flex items-center gap-3'>
									<Image
										src={getAuthorImage(item)}
										alt='Profile Picture'
										width={20}
										height={20}
										className='rounded-full object-cover'
									/>
									<p className='!text-small-regular text-light-1'>
										<span className='mr-1 text-primary'>
											{getAuthorName(item)}
										</span>
										{getActivityText(item.type)}
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
