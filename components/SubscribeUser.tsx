'use client'

import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

interface SubscriptionResponse {
	success: boolean
	message: string
}

export const SubscribeUser = ({
	userId,
	initialStatus,
	onSubscribe,
	onUnsubscribe,
}: {
	userId: string
	initialStatus: boolean
	onSubscribe: (userId: string) => Promise<SubscriptionResponse>
	onUnsubscribe: (userId: string) => Promise<SubscriptionResponse>
}) => {
	const [isLoading, setIsLoading] = useState(false)
	const [isSubscribed, setIsSubscribed] = useState(initialStatus)

	// Синхронизируем состояние при изменении initialStatus
	useEffect(() => {
		setIsSubscribed(initialStatus)
	}, [initialStatus])

	const handleToggleSubscription = async () => {
		setIsLoading(true)
		try {
			const action = isSubscribed ? onUnsubscribe : onSubscribe
			const { success, message } = await action(userId)

			if (success) {
				setIsSubscribed(!isSubscribed)
			}
		} catch (error) {
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<Button
			variant={isSubscribed ? 'outline' : 'default'}
			onClick={handleToggleSubscription}
			disabled={isLoading}
		>
			{isLoading ? 'Processing...' : isSubscribed ? 'Unsubscribe' : 'Subscribe'}
		</Button>
	)
}
