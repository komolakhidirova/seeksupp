'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from '@/components/ui/form'
import { createPost } from '@/lib/actions/post.actions'
import { redirect } from 'next/navigation'
import { Textarea } from '../ui/textarea'

const formSchema = z.object({
	text: z.string().min(1, { message: 'Text is required' }),
	anonym: z.boolean(),
	parent_id: z.string(),
})

const PostForm = ({ parentId, isAnon }: { parentId: string; isAnon: any }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			text: '',
			anonym: isAnon,
			parent_id: parentId,
		},
	})

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const post = await createPost(values)
		if (!post) {
			console.log('Failed to create a comment')
			redirect('/')
		} else {
			form.reset()
			redirect(`/posts/${parentId}`)
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='comment-form'>
				<FormField
					control={form.control}
					name='text'
					render={({ field }) => (
						<FormItem className='flex items-center gap-3 w-full'>
							<FormControl>
								<Textarea
									placeholder='Comment...'
									{...field}
									className='input'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type='submit' className='comment-form_btn'>
					Reply
				</Button>
			</form>
		</Form>
	)
}

export default PostForm
