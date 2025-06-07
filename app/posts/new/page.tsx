import PostForm from '@/components/forms/PostForm'
import { isUserAnonymous } from '@/lib/actions/user.actions'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const Page = async () => {
	const { userId } = await auth()
	if (!userId) redirect('/sign-in')

	const isAnon = await isUserAnonymous()

	return (
		<main className='items-center justify-center'>
			<article className='w-full gap-4 flex flex-col '>
				<h1>Create Post</h1>
				<div className='mt-6'>
					<PostForm isAnon={isAnon} />
				</div>
			</article>
		</main>
	)
}

export default Page
