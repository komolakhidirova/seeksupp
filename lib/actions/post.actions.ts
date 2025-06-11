'use server'

import { createSupabaseClient } from '@/lib/supabase'
import clerkClient from '@clerk/clerk-sdk-node'
import { auth } from '@clerk/nextjs/server'
import { isUserAnonymous } from './user.actions'

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

export const deletePost = async (
	postId: string,
	userId: string,
	force = false
) => {
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

export const editPost = async (
	postId: string,
	text: string,
	userId: string
) => {
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

	const { data: repliesToUserPosts, error: repliesError } = await supabase
		.from('posts')
		.select('id, author, created_at, parent_id')
		.in('parent_id', postIds)
		.neq('author', userId)

	if (repliesError) throw repliesError

	const repliesWithAuthors: ActivityItem[] = await Promise.all(
		repliesToUserPosts.map(async reply => {
			const user = await clerkClient.users.getUser(reply.author)
			const author = {
				id: user.id,
				name: user.firstName ?? 'Unknown',
				image: user.imageUrl,
			}

			return {
				id: reply.id,
				type: 'reply',
				created_at: reply.created_at,
				parent_id: reply.parent_id,
				anonym: false,
				author,
			}
		})
	)

	const { data: postsData, error: postsError } = await supabase
		.from('posts')
		.select('id, likes, reports')
		.eq('author', userId)

	if (postsError) throw postsError

	const likesWithUsers: ActivityItem[] = []
	const reportsWithUsers: ActivityItem[] = []

	for (const post of postsData) {
		const likers = (post.likes || []).filter((id: string) => id !== userId)
		const reporters = (post.reports || []).filter((id: string) => id !== userId)

		for (const likerId of likers) {
			const user = await clerkClient.users.getUser(likerId)
			const author = {
				id: user.id,
				name: user.firstName ?? 'Unknown',
				image: user.imageUrl,
			}

			likesWithUsers.push({
				id: `${post.id}-like-${Math.random()}`,
				type: 'like',
				post_id: post.id,
				author,
			})
		}

		for (const reporterId of reporters) {
			const user = await clerkClient.users.getUser(reporterId)
			const author = {
				id: user.id,
				name: user.firstName ?? 'Unknown',
				image: user.imageUrl,
			}

			reportsWithUsers.push({
				id: `${post.id}-report-${Math.random()}`,
				type: 'report',
				post_id: post.id,
				author,
			})
		}
	}

	return [...repliesWithAuthors, ...likesWithUsers, ...reportsWithUsers]
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

export const likePost = async (postId: string, userId: string) => {
	const supabase = createSupabaseClient()

	const { data: post, error: fetchError } = await supabase
		.from('posts')
		.select('likes')
		.eq('id', postId)
		.single()

	if (fetchError) throw new Error(fetchError.message)
	if (!post) throw new Error('Post not found')

	const currentLikes = post.likes || []

	const isAnon = await isUserAnonymous()

	if (isAnon) {
		const anonId = 'user_2yB8iaPI6naDeXyuQV2BRpaeetr'
		const { error: updateError } = await supabase
			.from('posts')
			.update({ likes: [...currentLikes, anonId] })
			.eq('id', postId)

		if (updateError) throw new Error(updateError.message)
	} else {
		if (!currentLikes.includes(userId)) {
			const { error: updateError } = await supabase
				.from('posts')
				.update({ likes: [...currentLikes, userId] })
				.eq('id', postId)

			if (updateError) throw new Error(updateError.message)
		}
	}
}

export const unlikePost = async (postId: string, userId: string) => {
	const supabase = createSupabaseClient()

	const { data: post, error: fetchError } = await supabase
		.from('posts')
		.select('likes')
		.eq('id', postId)
		.single()

	if (fetchError) throw new Error(fetchError.message)
	if (!post) throw new Error('Post not found')

	const currentLikes = post.likes || []
	const isAnon = await isUserAnonymous()
	const targetId = isAnon ? 'user_2yB8iaPI6naDeXyuQV2BRpaeetr' : userId

	let updatedLikes: string[] = []

	if (isAnon) {
		let removed = false
		updatedLikes = currentLikes.filter((id: string) => {
			if (!removed && id === targetId) {
				removed = true
				return false
			}
			return true
		})
	} else {
		updatedLikes = currentLikes.filter((id: string) => id !== targetId)
	}

	if (updatedLikes.length !== currentLikes.length) {
		const { error: updateError } = await supabase
			.from('posts')
			.update({ likes: updatedLikes })
			.eq('id', postId)

		if (updateError) throw new Error(updateError.message)
	}
}

export const checkLike = async (postId: string, userId: string) => {
	const supabase = createSupabaseClient()

	const { data: post, error } = await supabase
		.from('posts')
		.select('likes')
		.eq('id', postId)
		.single()

	if (error) throw new Error(error.message)
	if (!post) return false

	const currentLikes = post.likes || []
	const isAnon = await isUserAnonymous()
	const targetId = isAnon ? 'user_2yB8iaPI6naDeXyuQV2BRpaeetr' : userId

	return currentLikes.includes(targetId)
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

export const reportPost = async (postId: string, userId: string) => {
	const supabase = createSupabaseClient()

	const { data: post, error: fetchError } = await supabase
		.from('posts')
		.select('reports')
		.eq('id', postId)
		.single()

	if (fetchError) throw new Error(fetchError.message)
	if (!post) throw new Error('Post not found')

	const currentReports = post.reports || []
	const isAnon = await isUserAnonymous()
	const reportId = isAnon ? 'user_2yB8iaPI6naDeXyuQV2BRpaeetr' : userId

	let updatedReports = currentReports

	if (isAnon) {
		updatedReports = [...currentReports, reportId]
	} else {
		if (currentReports.includes(userId)) return
		updatedReports = [...currentReports, userId]
	}

	const { error: updateError } = await supabase
		.from('posts')
		.update({ reports: updatedReports })
		.eq('id', postId)

	if (updateError) throw new Error(updateError.message)

	if (updatedReports.length >= 3) {
		await deletePost(postId, userId, true)
	}
}
