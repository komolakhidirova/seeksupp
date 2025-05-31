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
import { Textarea } from './ui/textarea'

const formSchema = z.object({
	text: z.string().min(1, { message: 'Text is required' }),
	anonym: z.boolean({ message: 'Anonymity is required' }),
})

const PostForm = () => {
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			text: '',
			anonym: false,
		},
	})

	const onSubmit = async (values: z.infer<typeof formSchema>) => {
		// const companion = await createCompanion(values)
		// if (companion) {
		// 	redirect(`/companions/${companion.id}`)
		// } else {
		// 	console.log('Failed to create a companion')
		// 	redirect('/')
		// }
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

				<FormField
					control={form.control}
					name='anonym'
					render={({ field }) => (
						<FormItem>
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

				<Button type='submit' className='w-full cursor-pointer bg-primary'>
					Create Post
				</Button>
			</form>
		</Form>
	)
}

export default PostForm
