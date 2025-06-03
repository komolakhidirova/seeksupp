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
	let query = supabase
		.from('posts')
		.select()
		.eq('parent_id', 'no')
		.order('created_at', { ascending: false })
	const { data: posts, error } = await query

	if (error) throw new Error(error.message)

	return posts
}

export const getUserById = async (userId: string) => {
	const { firstName, imageUrl } = await clerkClient.users.getUser(userId)

	return { firstName, imageUrl }
}

export const getPostById = async (id: string) => {
	const supabase = createSupabaseClient()

	const { data, error } = await supabase.from('posts').select().eq('id', id)

	if (error) return console.log(error)

	return data[0]
}

export const getUserPosts = async (userId: string) => {
	const supabase = createSupabaseClient()
	const { data, error } = await supabase
		.from('posts')
		.select()
		.eq('author', userId)
		.eq('parent_id', 'no')
		.order('created_at', { ascending: false })

	if (error) throw new Error(error.message)

	return data
}

export const getComments = async (id: string) => {
	const supabase = createSupabaseClient()

	const { data, error } = await supabase
		.from('posts')
		.select()
		.eq('parent_id', id)
		.order('created_at', { ascending: false })

	if (error) return console.log(error)

	return data
}

//GPT
async function fetchAllChildPosts(postId: string): Promise<any[]> {
	const supabase = createSupabaseClient()
	const { data: childPosts, error } = await supabase
		.from('posts')
		.select('*')
		.eq('parent_id', postId)

	if (error) throw new Error(error.message)

	const descendants: any[] = []

	for (const child of childPosts) {
		const childDescendants = await fetchAllChildPosts(child.id)
		descendants.push(child, ...childDescendants)
	}

	return descendants
}

export const deletePost = async (postId: string) => {
	const { userId } = await auth()
	const supabase = createSupabaseClient()

	// Получаем основной пост
	const { data: post, error: fetchError } = await supabase
		.from('posts')
		.select('*')
		.eq('id', postId)
		.single()

	if (fetchError || !post) {
		throw new Error(fetchError?.message || 'Post not found')
	}

	// Проверка: пользователь — автор?
	if (post.author !== userId) {
		throw new Error('Unauthorized: You are not the author of this post.')
	}

	// Получаем всех потомков
	const childPosts = await fetchAllChildPosts(postId)

	// Собираем все ID, включая основной
	const allIds = [postId, ...childPosts.map(p => p.id)]

	// Удаляем все посты одним запросом
	const { error: deleteError } = await supabase
		.from('posts')
		.delete()
		.in('id', allIds)

	if (deleteError) {
		throw new Error(deleteError.message)
	}
}
