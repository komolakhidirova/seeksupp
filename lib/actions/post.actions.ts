'use server'

import { createSupabaseClient } from '@/lib/supabase'
import clerkClient from '@clerk/clerk-sdk-node'
import { auth } from '@clerk/nextjs/server'

export const createPost = async (formData: CreatePost) => {
	const { userId: author } = await auth()
	const supabase = createSupabaseClient()

	const { data, error } = await supabase
		.from('posts')
		.insert({ ...formData, author })
		.select()

	if (error || !data)
		throw new Error(error?.message || 'Failed to create a post')

	return data[0]
}

export const getAllPosts = async () => {
	const supabase = createSupabaseClient()
	let query = supabase.from('posts').select()
	const { data: posts, error } = await query

	if (error) throw new Error(error.message)

	return posts
}

export const getUserById = async (userId: string) => {
	const { firstName, imageUrl } = await clerkClient.users.getUser(userId)

	return { firstName, imageUrl }
}

// export const getCompanion = async (id: string) => {
// 	const supabase = createSupabaseClient()

// 	const { data, error } = await supabase
// 		.from('Companions')
// 		.select()
// 		.eq('id', id)

// 	if (error) return console.log(error)

// 	return data[0]
// }

export const getUserPosts = async (userId: string) => {
	const supabase = createSupabaseClient()
	const { data, error } = await supabase
		.from('posts')
		.select()
		.eq('author', userId)

	if (error) throw new Error(error.message)

	return data
}
