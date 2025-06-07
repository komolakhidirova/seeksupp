'use server'

import clerkClient from '@clerk/clerk-sdk-node'
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export const getUserById = async (userId: string) => {
	const { firstName, imageUrl, emailAddresses } =
		await clerkClient.users.getUser(userId)

	return { firstName, imageUrl, emailAddresses }
}

export const addSubscription = async (subscriptionId: string) => {
	const { userId } = await auth()
	if (!userId) throw new Error('User not authenticated')

	const user = await clerkClient.users.getUser(userId)
	const currentSubscriptions = Array.isArray(user.publicMetadata.subscriptions)
		? (user.publicMetadata.subscriptions as string[])
		: []

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
}

export const checkSubscription = async (
	subscriberId: string,
	targetUserId: string
) => {
	const user = await clerkClient.users.getUser(subscriberId)
	const subscriptions = user.publicMetadata.subscriptions || []
	return Array.isArray(subscriptions)
		? subscriptions.includes(targetUserId)
		: false
}

export const removeSubscription = async (subscriptionId: string) => {
	const { userId } = await auth()
	if (!userId) throw new Error('User not authenticated')

	const user = await clerkClient.users.getUser(userId)
	const currentSubscriptions = Array.isArray(user.publicMetadata.subscriptions)
		? (user.publicMetadata.subscriptions as string[])
		: []

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
}

// Anon
export async function switchAccount() {
	const user = await currentUser()
	if (!user) redirect('/sign-in')

	const userId = user.id
	const isAnon = user.publicMetadata?.isAnon === true

	await clerkClient.users.updateUser(userId, {
		publicMetadata: {
			...user.publicMetadata,
			isAnon: !isAnon,
			originalId: !isAnon ? userId : null,
		},
	})

	redirect('/profile')
}

export async function isUserAnonymous() {
	const user = await currentUser()
	if (!user) return false

	return user.publicMetadata?.isAnon === true
}
