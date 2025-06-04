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
	const { firstName, imageUrl, emailAddresses } =
		await clerkClient.users.getUser(userId)

	return { firstName, imageUrl, emailAddresses }
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

export const editPost = async (postId: string, text: string) => {
	const { userId } = await auth()
	const supabase = createSupabaseClient()

	// Получаем пост, чтобы проверить автора
	const { data: post, error: fetchError } = await supabase
		.from('posts')
		.select('*')
		.eq('id', postId)
		.single()

	if (fetchError || !post) {
		throw new Error(fetchError?.message || 'Post not found')
	}

	// Проверка прав
	if (post.author !== userId) {
		throw new Error('Unauthorized: You are not the author of this post.')
	}

	// Обновляем текст
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

export async function getActivity(userId: string) {
	try {
		const supabase = createSupabaseClient()

		// Find all posts created by the user
		const { data: userPosts, error: userPostsError } = await supabase
			.from('posts')
			.select('id')
			.eq('author', userId)
			.eq('parent_id', 'no')

		if (userPostsError) throw userPostsError

		// Collect all the child post ids (replies) from the 'parent_id' field
		// First get all replies to the user's posts
		const { data: repliesToUserPosts, error: repliesError } = await supabase
			.from('posts')
			.select('id, author, created_at, parent_id, anonym')
			.in(
				'parent_id',
				userPosts.map(post => post.id)
			)
			.neq('author', userId) // Exclude replies authored by the same user

		if (repliesError) throw repliesError

		// Populate author information for each reply
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
	} catch (error) {
		console.error('Error fetching activity: ', error)
		throw error
	}
}

export const addSubscription = async (subscriptionId: string) => {
	const { userId } = await auth()

	if (!userId) {
		throw new Error('User not authenticated')
	}

	try {
		const user = await clerkClient.users.getUser(userId)

		// Явно указываем тип для subscriptions
		const currentSubscriptions = Array.isArray(
			user.publicMetadata.subscriptions
		)
			? (user.publicMetadata.subscriptions as string[])
			: []

		// Проверяем наличие ID (теперь TypeScript знает что это массив)
		if (!currentSubscriptions.includes(subscriptionId)) {
			const updatedSubscriptions = [...currentSubscriptions, subscriptionId]

			await clerkClient.users.updateUser(userId, {
				publicMetadata: {
					...user.publicMetadata,
					subscriptions: updatedSubscriptions,
				},
			})

			return { success: true, message: 'Subscription added' }
		}

		return { success: false, message: 'Subscription already exists' }
	} catch (error) {
		console.error('Error updating subscriptions:', error)
		throw new Error('Failed to update subscriptions')
	}
}

export const getSubscriptionPosts = async (userId: string) => {
	if (!userId) {
		throw new Error('User not authenticated')
	}

	try {
		// 1. Получаем подписки пользователя
		const user = await clerkClient.users.getUser(userId)
		const subscriptions = Array.isArray(user.publicMetadata.subscriptions)
			? (user.publicMetadata.subscriptions as string[])
			: []

		// Если нет подписок, возвращаем пустой массив
		if (subscriptions.length === 0) return []

		// 2. Получаем посты из Supabase
		const supabase = createSupabaseClient()
		const { data: posts, error } = await supabase
			.from('posts')
			.select('*')
			.in('author', subscriptions)
			.eq('anonym', false)
			.eq('parent_id', 'no')
			.order('created_at', { ascending: false })

		if (error) throw error

		// 3. Дополнительно получаем информацию об авторах
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
	} catch (error) {
		console.error('Error getting subscription posts:', error)
		throw new Error('Failed to get subscription posts')
	}
}

export const checkSubscriptionStatus = async (
	subscriberId: string,
	targetUserId: string
): Promise<boolean> => {
	// Упрощаем до boolean
	try {
		const user = await clerkClient.users.getUser(subscriberId)
		const subscriptions = user.publicMetadata.subscriptions || []
		return Array.isArray(subscriptions)
			? subscriptions.includes(targetUserId)
			: false
	} catch (error) {
		console.error('Subscription check failed:', error)
		return false
	}
}

export const unsubscribe = async (subscriptionId: string) => {
	const { userId } = await auth()

	if (!userId) {
		throw new Error('User not authenticated')
	}

	try {
		const user = await clerkClient.users.getUser(userId)
		const currentSubscriptions = Array.isArray(
			user.publicMetadata.subscriptions
		)
			? (user.publicMetadata.subscriptions as string[])
			: []

		// Фильтруем, удаляя target ID из подписок
		const updatedSubscriptions = currentSubscriptions.filter(
			id => id !== subscriptionId
		)

		await clerkClient.users.updateUser(userId, {
			publicMetadata: {
				...user.publicMetadata,
				subscriptions: updatedSubscriptions,
			},
		})

		return {
			success: true,
			message: 'Unsubscribed successfully',
			newCount: updatedSubscriptions.length,
		}
	} catch (error) {
		console.error('Error unsubscribing:', error)
		throw new Error('Failed to unsubscribe')
	}
}
