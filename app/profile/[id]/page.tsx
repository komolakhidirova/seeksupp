import PostCard from '@/components/PostCard'
import { SubscribeUser } from '@/components/SubscribeUser'

import {
	addSubscription,
	checkSubscriptionStatus,
	getUserById,
	getUserNoAnonPosts,
	unsubscribe,
} from '@/lib/actions/post.actions'
import { currentUser } from '@clerk/nextjs/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'

interface PostSessionPageProps {
	params: Promise<{ id: string }>
}

const Page = async ({ params }: PostSessionPageProps) => {
	const { id } = await params
	const { firstName, imageUrl, emailAddresses } = await getUserById(id)
	const posts = await getUserNoAnonPosts(id)

	const user = await currentUser()
	if (!user) redirect('/sign-in')

	const isSubscribed = await checkSubscriptionStatus(user.id, id)

	return (
		<main className='min-lg:w-3/4'>
			<section className='flex justify-between gap-4 max-sm:flex-col items-center mt-9'>
				<div className='flex gap-4 items-center'>
					<Image
						src={imageUrl}
						alt={firstName!}
						width={110}
						height={110}
						className='rounded-full'
					/>
					<div className='flex flex-col gap-2'>
						<h1 className='font-bold text-2xl'>{firstName}</h1>
						<p className='text-sm text-muted-foreground'>
							{emailAddresses[0].emailAddress}
						</p>
						<SubscribeUser
							userId={id}
							initialStatus={isSubscribed}
							onSubscribe={addSubscription}
							onUnsubscribe={unsubscribe}
						/>
					</div>
				</div>
			</section>
			<section className='mt-9 flex flex-col gap-10'>
				{posts.map(post => (
					<PostCard
						key={post.id}
						{...post}
						authorId={post.author}
						currentUser={user.id}
					/>
				))}
			</section>
		</main>
	)
}

export default Page
