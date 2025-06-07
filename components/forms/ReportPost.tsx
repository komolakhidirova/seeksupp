'use client'

import { reportPost } from '@/lib/actions/post.actions'
import Image from 'next/image'
import { useState } from 'react'

const ReportPost = ({ id }: { id: string }) => {
	const [showReportConfirm, setShowReportConfirm] = useState(false)

	const confirmReport = async () => {
		setShowReportConfirm(false)
		try {
			await reportPost(id)
			alert('Thank you. This post has been reported.')
		} catch (error) {
			console.error('Failed to report the post:', error)
		}
	}

	return (
		<div className='relative'>
			<Image
				src='/assets/report.svg'
				alt='report'
				width={18}
				height={18}
				className='cursor-pointer object-contain'
				onClick={() => setShowReportConfirm(true)}
			/>

			{showReportConfirm && (
				<div className='absolute left-1/2 -translate-x-1/2 top-7 z-50 w-64 border border-red-500 rounded-xl bg-white p-4 shadow-lg'>
					<h3 className='text-base font-semibold mb-2'>Report this post?</h3>
					<p className='text-sm mb-4'>
						Are you sure you want to report this post?
					</p>
					<div className='flex justify-end gap-4'>
						<button
							onClick={() => setShowReportConfirm(false)}
							className='text-sm text-gray-500'
						>
							Cancel
						</button>
						<button onClick={confirmReport} className='text-sm text-red-500'>
							Report
						</button>
					</div>
				</div>
			)}
		</div>
	)
}

export default ReportPost
