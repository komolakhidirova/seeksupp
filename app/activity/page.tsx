import { getActivity } from '@/lib/actions/post.actions'
import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

type ActivityItem = {
	id: string
	type: 'reply' | 'like' | 'report'
	created_at?: string
	post_id?: string
	parent_id?: string
	anonym?: boolean
	author: {
		id: string
		name: string
		image: string
	}
}

const getAuthorImage = (item: ActivityItem) =>
	item.anonym ? '/assets/user-dark.svg' : item.author.image

const getAuthorName = (item: ActivityItem) =>
	item.anonym ? 'User' : item.author.name

const getPostLink = (item: ActivityItem) => {
	if (item.type === 'reply') return `/posts/${item.parent_id}`
	return `/posts/${item.post_id}`
}

const getActivityText = (type: ActivityItem['type']) => {
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

const Page = async () => {
	const user = await currentUser()
	if (!user) redirect('/sign-in')

	const activity = await getActivity(user.id)

	return (
		<section>
			<h1 className='text-heading3-bold text-light-1'>Activity</h1>

			<section className='mt-10 flex flex-col gap-5'>
				{activity.length > 0 ? (
					activity.map(item => (
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
					))
				) : (
					<p className='!text-base-regular text-light-3'>No activity yet</p>
				)}
			</section>
		</section>
	)
}

export default Page
