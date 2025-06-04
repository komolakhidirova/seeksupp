import Image from 'next/image'

const Page = () => {
	return (
		<main className='min-lg:w-3/4'>
			<section className='flex justify-between gap-4 max-sm:flex-col items-center mt-9'>
				<div className='flex gap-4 items-center'>
					<Image
						src='/assets/user-dark.svg'
						alt='User'
						width={110}
						height={110}
						className='rounded-full'
					/>
					<div className='flex flex-col gap-2'>
						<h1 className='font-bold text-2xl'>User</h1>
						<p className='text-sm text-muted-foreground'>Email is hidden</p>
					</div>
				</div>
			</section>
			<section className='mt-9 flex flex-col gap-10'>Posts are hidden</section>
		</main>
	)
}

export default Page
