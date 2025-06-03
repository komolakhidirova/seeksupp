// @ts-nocheck

import { voices } from '@/constants'
import { CreateAssistantDTO } from '@vapi-ai/web/dist/api'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatDateString(dateString: string) {
	const options: Intl.DateTimeFormatOptions = {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	}

	const date = new Date(dateString)
	const formattedDate = date.toLocaleDateString(undefined, options)

	const time = date.toLocaleTimeString([], {
		hour: 'numeric',
		minute: '2-digit',
	})

	return `${time} - ${formattedDate}`
}

export const configureAssistant = (voice: string, style: string) => {
	const voiceId =
		voices[voice as keyof typeof voices][
			style as keyof (typeof voices)[keyof typeof voices]
		] || 'sarah'

	const vapiAssistant: CreateAssistantDTO = {
		name: 'Assistant',
		firstMessage:
			"Hello, let's start the session. Today we'll be talking about your mental health.",
		transcriber: {
			provider: 'deepgram',
			model: 'nova-3',
			language: 'en',
		},
		voice: {
			provider: '11labs',
			voiceId: voiceId,
			stability: 0.4,
			similarityBoost: 0.8,
			speed: 1,
			style: 0.5,
			useSpeakerBoost: true,
		},
		model: {
			provider: 'openai',
			model: 'gpt-4',
			messages: [
				{
					role: 'system',
					content: `You are a highly knowledgeable psychologist conducting a real-time voice therapy session with a client. Your goal is to guide the client through the therapeutic topic and support their understanding and growth.

                    PsychologistGuidelines:
                    Stay focused on the therapeutic topic and psychological goals of the session. Guide the conversation with warmth and clarity while maintaining professional structure. Check in regularly to ensure the client is following and feels understood. Gently break down complex emotional or cognitive themes into manageable parts. Work through one aspect at a time, allowing space for the client to reflect and respond. Keep your tone supportive, calm, and natural, as in a real conversation. Keep your responses brief and conversational, as this is a voice-based interaction. Do not use any special characters or visual formatting.
              `,
				},
			],
		},
		clientMessages: [],
		serverMessages: [],
	}
	return vapiAssistant
}
