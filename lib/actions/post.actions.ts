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

export const deletePost = async (postId: string, force = false) => {
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
	if (!force && post.author !== userId) {
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

export const getActivity = async (userId: string): Promise<ActivityItem[]> => {
	const supabase = createSupabaseClient()

	const { data: userPosts, error: userPostsError } = await supabase
		.from('posts')
		.select('id')
		.eq('author', userId)

	if (userPostsError) throw userPostsError

	const postIds = userPosts.map(post => post.id)

	// Получаем ответы
	const { data: repliesToUserPosts, error: repliesError } = await supabase
		.from('posts')
		.select('id, author, created_at, parent_id, anonym')
		.in('parent_id', postIds)
		.neq('author', userId)

	if (repliesError) throw repliesError

	const repliesWithAuthors: ActivityItem[] = await Promise.all(
		repliesToUserPosts.map(async reply => {
			const user = await clerkClient.users.getUser(reply.author)
			return {
				id: reply.id,
				type: 'reply',
				created_at: reply.created_at,
				parent_id: reply.parent_id,
				anonym: reply.anonym,
				author: {
					id: reply.author,
					name: user.firstName,
					image: user.imageUrl,
				},
			}
		})
	)

	// Получаем лайки
	const { data: allPostsWithLikes, error: likesError } = await supabase
		.from('posts')
		.select('id, likes')
		.eq('author', userId)

	if (likesError) throw likesError

	const likesWithUsers: ActivityItem[] = []

	for (const post of allPostsWithLikes) {
		const likers = (post.likes || []).filter((id: string) => id !== userId)

		for (const likerId of likers) {
			const user = await clerkClient.users.getUser(likerId)
			likesWithUsers.push({
				id: `${post.id}-${likerId}`,
				type: 'like',
				post_id: post.id,
				author: {
					id: likerId,
					name: user.firstName,
					image: user.imageUrl,
				},
			})
		}
	}

	return [...repliesWithAuthors, ...likesWithUsers]
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

export const likePost = async (postId: string) => {
	const supabase = createSupabaseClient()
	const { userId } = await auth()
	if (!userId) throw new Error('User not authenticated')

	const { data: post, error: fetchError } = await supabase
		.from('posts')
		.select('likes')
		.eq('id', postId)
		.single()

	if (fetchError) throw new Error(fetchError.message)
	if (!post) throw new Error('Post not found')

	const currentLikes = post.likes || []
	if (!currentLikes.includes(userId)) {
		const { error: updateError } = await supabase
			.from('posts')
			.update({ likes: [...currentLikes, userId] })
			.eq('id', postId)

		if (updateError) throw new Error(updateError.message)
	}
}

export const unlikePost = async (postId: string) => {
	const supabase = createSupabaseClient()
	const { userId } = await auth()
	if (!userId) throw new Error('User not authenticated')

	const { data: post, error: fetchError } = await supabase
		.from('posts')
		.select('likes')
		.eq('id', postId)
		.single()

	if (fetchError) throw new Error(fetchError.message)
	if (!post) throw new Error('Post not found')

	const currentLikes = post.likes || []
	if (currentLikes.includes(userId)) {
		const { error: updateError } = await supabase
			.from('posts')
			.update({ likes: currentLikes.filter((id: string) => id !== userId) })
			.eq('id', postId)

		if (updateError) throw new Error(updateError.message)
	}
}

export const checkLike = async (postId: string) => {
	const supabase = createSupabaseClient()
	const { userId } = await auth()
	// if (!userId) throw new Error('User not authenticated')

	const { data: post, error } = await supabase
		.from('posts')
		.select('likes')
		.eq('id', postId)
		.single()

	if (error) throw new Error(error.message)
	if (!post) return false

	return (post.likes || []).includes(userId)
}

export const getLikesCount = async (postId: string) => {
	const supabase = createSupabaseClient()

	const { data: post, error } = await supabase
		.from('posts')
		.select('likes')
		.eq('id', postId)
		.single()

	if (error) throw new Error(error.message)
	if (!post) return 0

	return (post.likes || []).length
}

export const reportPost = async (postId: string) => {
	const supabase = createSupabaseClient()
	const { userId } = await auth()
	if (!userId) throw new Error('User not authenticated')

	const { data: post, error: fetchError } = await supabase
		.from('posts')
		.select('reports')
		.eq('id', postId)
		.single()

	if (fetchError) throw new Error(fetchError.message)
	if (!post) throw new Error('Post not found')

	const currentReports = post.reports || []
	if (currentReports.includes(userId)) return

	const updatedReports = [...currentReports, userId]

	const { error: updateError } = await supabase
		.from('posts')
		.update({ reports: updatedReports })
		.eq('id', postId)

	if (updateError) throw new Error(updateError.message)

	if (updatedReports.length >= 3) {
		await deletePost(postId, true)
	}
}
