import PostForm from '@/components/PostForm'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

const Page = async () => {
	const { userId } = await auth()
	if (!userId) redirect('/sign-in')

	return (
		<main className='items-center justify-center'>
			<article className='w-full gap-4 flex flex-col '>
				<h1>Create Post</h1>
				<div className='mt-6'>
					<PostForm />
				</div>
			</article>
		</main>
	)
}

export default Page
