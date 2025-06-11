'use client'

import { editPost } from '@/lib/actions/post.actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
	id: string
	initialText: string
	onCancel: () => void
	currentUser: string
}

const EditPost = ({ id, initialText, onCancel, currentUser }: Props) => {
	const [editedText, setEditedText] = useState(initialText)
	const router = useRouter()

	const handleSave = async () => {
		if (editedText !== initialText) {
			try {
				await editPost(id, editedText, currentUser)
				router.refresh()
			} catch (error) {
				console.error('Failed to save post:', error)
			}
		}
		onCancel()
	}

	return (
		<div>
			<textarea
				className='mt-2 p-2 rounded-md w-full'
				value={editedText}
				onChange={e => setEditedText(e.target.value)}
			/>
			<div className='mt-2 flex gap-2'>
				<button
					onClick={handleSave}
					className='text-sm text-primary cursor-pointer'
				>
					Save
				</button>
				<button
					onClick={onCancel}
					className='text-sm text-gray-500 cursor-pointer'
				>
					Cancel
				</button>
			</div>
		</div>
	)
}

export default EditPost
