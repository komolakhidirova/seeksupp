'use client'

import { deletePost } from '@/lib/actions/post.actions'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
	id: string
}

const DeletePost = ({ id }: Props) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
	const router = useRouter()

	const confirmDelete = async () => {
		setShowDeleteConfirm(false)
		try {
			await deletePost(id)
			router.refresh()
		} catch (error) {
			console.error('Failed to delete the post:', error)
		}
	}

	return (
		<div className='relative'>
			<Image
				src='/assets/delete.svg'
				alt='delete'
				width={18}
				height={18}
				className='cursor-pointer object-contain'
				onClick={() => setShowDeleteConfirm(true)}
			/>
			{showDeleteConfirm && (
				<div className='absolute right-0 top-6 z-50 w-64 border-2 border-red-500 rounded-xl bg-white shadow-lg'>
					<div className='p-4'>
						<h3 className='text-lg font-semibold mb-2'>Delete this post?</h3>
						<p className='text-sm mb-4'>
							Are you sure you want to delete this post?
						</p>
						<div className='flex justify-end gap-4'>
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className='text-sm text-gray-500'
							>
								Cancel
							</button>
							<button onClick={confirmDelete} className='text-sm text-red-500'>
								Delete
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

export default DeletePost
