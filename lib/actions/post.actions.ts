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

	// Получаем посты пользователя
	const { data: userPosts, error: userPostsError } = await supabase
		.from('posts')
		.select('id')
		.eq('author', userId)

	if (userPostsError) throw userPostsError
	const postIds = userPosts.map(post => post.id)

	// Получаем ответы к постам пользователя
	const { data: repliesToUserPosts, error: repliesError } = await supabase
		.from('posts')
		.select('id, author, created_at, parent_id, anonym')
		.in('parent_id', postIds)
		.neq('author', userId)

	if (repliesError) throw repliesError

	const repliesWithAuthors: ActivityItem[] = await Promise.all(
		repliesToUserPosts.map(async reply => {
			let authorInfo = {
				id: reply.author,
				name: 'User',
				image: '/assets/user-dark.svg',
			}

			if (!reply.anonym) {
				const user = await clerkClient.users.getUser(reply.author)
				authorInfo = {
					id: user.id,
					name: user.firstName ?? 'Unknown',
					image: user.imageUrl,
				}
			}

			return {
				id: reply.id,
				type: 'reply',
				created_at: reply.created_at,
				parent_id: reply.parent_id,
				anonym: reply.anonym,
				author: authorInfo,
			}
		})
	)

	// Получаем лайки к постам пользователя
	const { data: likesData, error: likesError } = await supabase
		.from('likes')
		.select('post_id, user_id, created_at, anonym')
		.in('post_id', postIds)
		.neq('user_id', userId)

	if (likesError) throw likesError

	const likesWithUsers: ActivityItem[] = await Promise.all(
		likesData.map(async like => {
			let authorInfo = {
				id: like.user_id,
				name: 'User',
				image: '/assets/user-dark.svg',
			}

			if (!like.anonym) {
				const user = await clerkClient.users.getUser(like.user_id)
				authorInfo = {
					id: user.id,
					name: user.firstName ?? 'Unknown',
					image: user.imageUrl,
				}
			}

			return {
				id: `${like.post_id}-like-${like.user_id}`,
				type: 'like',
				created_at: like.created_at,
				post_id: like.post_id,
				anonym: like.anonym,
				author: authorInfo,
			}
		})
	)

	// Получаем посты пользователя с полем reports
	const { data: postsData, error: postsError } = await supabase
		.from('posts')
		.select('id, reports')
		.eq('author', userId)

	if (postsError) throw postsError

	const reportsWithUsers: ActivityItem[] = []

	for (const post of postsData) {
		const reporters = (post.reports || []).filter((id: string) => id !== userId)

		for (const reporterId of reporters) {
			const user = await clerkClient.users.getUser(reporterId)
			const author = {
				id: user.id,
				name: user.firstName ?? 'Unknown',
				image: user.imageUrl,
			}

			reportsWithUsers.push({
				id: `${post.id}-report-${reporterId}`,
				type: 'report',
				post_id: post.id,
				created_at: '', // Добавляем пустую дату, чтобы не было ошибки
				author,
			})
		}
	}

	// Объединяем все активности
	const allActivities: ActivityItem[] = [
		...reportsWithUsers,
		...repliesWithAuthors,
		...likesWithUsers,
	]

	// Сортируем: репорты первыми, остальные по created_at убыванию
	return allActivities.sort((a, b) => {
		if (a.type === 'report' && b.type !== 'report') return -1
		if (a.type !== 'report' && b.type === 'report') return 1

		return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	})
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
	const isAnon = await isUserAnonymous()

	const { data: existingLike, error: fetchError } = await supabase
		.from('likes')
		.select('id')
		.eq('post_id', postId)
		.eq('user_id', userId)
		.single()

	if (fetchError && fetchError.code !== 'PGRST116') {
		// PGRST116 — not found, значит лайка еще нет, и это не ошибка
		throw new Error(fetchError.message)
	}

	if (!existingLike) {
		const { error: insertError } = await supabase.from('likes').insert([
			{
				post_id: postId,
				user_id: userId,
				anonym: isAnon,
			},
		])

		if (insertError) throw new Error(insertError.message)
	}
}

export const unlikePost = async (postId: string, userId: string) => {
	const supabase = createSupabaseClient()

	const { error } = await supabase
		.from('likes')
		.delete()
		.eq('post_id', postId)
		.eq('user_id', userId)

	if (error) throw new Error(error.message)
}

export const checkLike = async (postId: string, userId: string) => {
	const supabase = createSupabaseClient()

	const { data, error } = await supabase
		.from('likes')
		.select('id')
		.eq('post_id', postId)
		.eq('user_id', userId)
		.single()

	if (error && error.code !== 'PGRST116') {
		throw new Error(error.message)
	}

	return !!data
}

export const getLikesCount = async (postId: string) => {
	const supabase = createSupabaseClient()

	const { count, error } = await supabase
		.from('likes')
		.select('*', { count: 'exact', head: true })
		.eq('post_id', postId)

	if (error) throw new Error(error.message)

	return count || 0
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
