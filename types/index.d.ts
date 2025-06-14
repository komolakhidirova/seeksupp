// type User = {
//   name: string;
//   email: string;
//   image?: string;
//   accountId: string;
// };

type ActivityItem = {
	id: string
	type: 'reply' | 'like' | 'report'
	created_at: string
	post_id?: string
	parent_id?: string
	created_at?: string
	anonym?: boolean
	author: {
		id: string
		name: string
		image: string
	}
}

type Companion = Models.DocumentList<Models.Document> & {
	$id: string
	name: string
	subject: Subject
	topic: string
	duration: number
	bookmarked: boolean
}

interface CreatePost {
	text: string
	anonym: boolean
	parent_id: string
}

interface GetAllCompanions {
	limit?: number
	page?: number
	subject?: string | string[]
	topic?: string | string[]
}

interface BuildClient {
	key?: string
	sessionToken?: string
}

interface CreateUser {
	email: string
	name: string
	image?: string
	accountId: string
}

interface SearchParams {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

interface Avatar {
	userName: string
	width: number
	height: number
	className?: string
}

interface SavedMessage {
	role: 'user' | 'system' | 'assistant'
	content: string
}

interface CompanionComponentProps {
	companionId: string
	subject: string
	topic: string
	name: string
	userName: string
	userImage: string
	voice: string
	style: string
}
