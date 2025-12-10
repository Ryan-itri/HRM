import { config } from '../config'

interface ApiResponse<T> {
    status: 'success' | 'error'
    data?: T
    message?: string
}

export const api = {
    async post<T>(action: string, payload: any = {}, sessionId: string = ''): Promise<T> {
        try {
            // GAS requires text/plain for CORS to work without preflight issues in some cases
            // But standard fetch with correct headers usually works if GAS backend handles OPTIONS
            // Here we use the text/plain hack which is standard for GAS API
            const response = await fetch(config.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify({
                    action,
                    payload,
                    sessionId
                })
            })

            const result: ApiResponse<T> = await response.json()

            if (result.status === 'error') {
                throw new Error(result.message || 'Unknown API Error')
            }

            return result.data as T
        } catch (error) {
            console.error('API Call Failed:', error)
            throw error
        }
    }
}
