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
	FormLabel,
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

const PostForm = ({ isAnon }: { isAnon: any }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			text: '',
			anonym: isAnon,
			parent_id: 'no',
		},
	})

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const post = await createPost(values)
		if (post) {
			redirect('/')
		} else {
			console.log('Failed to create a post')
			redirect('/posts/new')
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
				<FormField
					control={form.control}
					name='text'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Share your thoughts</FormLabel>
							<FormControl>
								<Textarea
									placeholder='How do you feel today?'
									{...field}
									className='input'
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type='submit' className='w-full cursor-pointer bg-primary'>
					Create Post
				</Button>
			</form>
		</Form>
	)
}

export default PostForm
