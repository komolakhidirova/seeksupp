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
	const { data: posts, error } = await supabase
		.from('posts')
		.select()
		.eq('parent_id', 'no')
		.order('created_at', { ascending: false })

	if (error) throw new Error(error.message)

	return posts
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

export const getUserNoAnonPosts = async (userId: string) => {
	const supabase = createSupabaseClient()
	const { data, error } = await supabase
		.from('posts')
		.select()
		.eq('author', userId)
		.eq('parent_id', 'no')
		.eq('anonym', false)
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

const fetchAllChildPosts = async (postId: string): Promise<any[]> => {
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
	const { data: post, error: fetchError } = await supabase
		.from('posts')
		.select('*')
		.eq('id', postId)
		.single()

	if (fetchError || !post) {
		throw new Error(fetchError?.message || 'Post not found')
	}
	if (post.author !== userId) {
		throw new Error('Unauthorized: You are not the author of this post.')
	}

	const childPosts = await fetchAllChildPosts(postId)
	const allIds = [postId, ...childPosts.map(p => p.id)]

	const { error: deleteError } = await supabase
		.from('posts')
		.delete()
		.in('id', allIds)

	if (deleteError) {
		throw new Error(deleteError.message)
	}
}

export const editPost = async (postId: string, text: string) => {
	const { userId } = await auth()
	const supabase = createSupabaseClient()
	const { data: post, error: fetchError } = await supabase
		.from('posts')
		.select('*')
		.eq('id', postId)
		.single()

	if (fetchError || !post) {
		throw new Error(fetchError?.message || 'Post not found')
	}
	if (post.author !== userId) {
		throw new Error('Unauthorized: You are not the author of this post.')
	}

	const { data, error: updateError } = await supabase
		.from('posts')
		.update({
			text,
			edited_at: new Date().toISOString(),
		})
		.eq('id', postId)
		.select()

	if (updateError || !data) {
		throw new Error(updateError?.message || 'Failed to update the post')
	}

	return data[0]
}

export const getActivity = async (userId: string) => {
	const supabase = createSupabaseClient()

	const { data: userPosts, error: userPostsError } = await supabase
		.from('posts')
		.select('id')
		.eq('author', userId)
		.eq('parent_id', 'no')

	if (userPostsError) throw userPostsError

	const { data: repliesToUserPosts, error: repliesError } = await supabase
		.from('posts')
		.select('id, author, created_at, parent_id, anonym')
		.in(
			'parent_id',
			userPosts.map(post => post.id)
		)
		.neq('author', userId)

	if (repliesError) throw repliesError

	const repliesWithAuthors = await Promise.all(
		repliesToUserPosts.map(async reply => {
			const user = await clerkClient.users.getUser(reply.author)
			return {
				...reply,
				author: {
					id: reply.author,
					name: user.firstName,
					image: user.imageUrl,
				},
			}
		})
	)

	return repliesWithAuthors
}

export const getSubscriptionPosts = async (userId: string) => {
	if (!userId) throw new Error('User not authenticated')

	const user = await clerkClient.users.getUser(userId)
	const subscriptions = Array.isArray(user.publicMetadata.subscriptions)
		? (user.publicMetadata.subscriptions as string[])
		: []

	if (subscriptions.length === 0) return []

	const supabase = createSupabaseClient()
	const { data: posts, error } = await supabase
		.from('posts')
		.select('*')
		.in('author', subscriptions)
		.eq('anonym', false)
		.eq('parent_id', 'no')
		.order('created_at', { ascending: false })

	if (error) throw error

	const postsWithAuthors = await Promise.all(
		posts.map(async post => {
			const author = await clerkClient.users.getUser(post.author)
			return {
				...post,
				authorInfo: {
					name: author.firstName,
					image: author.imageUrl,
				},
			}
		})
	)

	return postsWithAuthors
}
