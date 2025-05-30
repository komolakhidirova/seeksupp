import PostCard from '@/components/PostCard'

const Page = () => {
	return (
		<>
			<h1>Forum</h1>

			<section className='mt-9 flex flex-col gap-10'>
				<PostCard
					id='12'
					currentUserId='1'
					parentId=''
					content='First Post'
					author={{ name: 'Komola', image: '/assets/user-dark.svg', id: '' }}
					comments={[]}
					createdAt='222'
					isComment={false}
				/>
			</section>
		</>
	)
}

export default Page
