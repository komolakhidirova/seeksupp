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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
// import { createCompanion } from '@/lib/actions/companion.actions'
import { createPost } from '@/lib/actions/post.actions'
import { redirect } from 'next/navigation'
import { Textarea } from './ui/textarea'

const formSchema = z.object({
	text: z.string().min(1, { message: 'Text is required' }),
	anonym: z.boolean({ message: 'Anonymity is required' }),
	parent_id: z.string(),
})

const PostForm = (parentId: { parentId: string }) => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			text: '',
			anonym: true,
			parent_id: parentId.parentId,
		},
	})

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		const post = await createPost(values)
		if (!post) {
			console.log('Failed to create a comment')
			redirect('/')
		} else {
			form.reset()
			redirect(`/posts/${parentId.parentId}`)
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

				<FormField
					control={form.control}
					name='anonym'
					render={({ field }) => (
						<FormItem className='max-sm:w-full'>
							<FormLabel>Anonymity</FormLabel>
							<FormControl>
								<Select
									onValueChange={value => field.onChange(value === 'true')}
									value={String(field.value)}
									defaultValue={String(field.value)}
								>
									<SelectTrigger className='input'>
										<SelectValue placeholder='Select the anonymity' />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='true'>Anonymously</SelectItem>
										<SelectItem value='false'>My Account</SelectItem>
									</SelectContent>
								</Select>
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
