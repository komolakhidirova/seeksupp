import PostForm from '@/components/PostForm'

const Page = () => {
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
