import {
    type APIApplicationCommand,
    type APIWebhook,
    type RESTPostAPIApplicationCommandsJSONBody,
    type RESTPostAPIWebhookWithTokenJSONBody,
    Routes,
} from 'discord-api-types/v10'

export class DiscordClient {
    public headers: Record<string, string>

    constructor(
        public baseUrl: string,
        public token: string,
    ) {
        this.baseUrl = baseUrl
        this.token = token
        this.headers = {
            'content-type': 'application/json',
            authorization: `Bot ${token}`,
        }
    }

    async makeRequest<ResponseBody>(
        endpoint: string,
        method = 'GET',
        body?: unknown,
    ): Promise<ResponseBody | undefined> {
        const request = new Request(this.baseUrl + endpoint, {
            body: JSON.stringify(body),
            headers: this.headers,
            method,
        })
        const response = await fetch(request)
        if (!response.ok) {
            const error = await response.text()
            throw new Error(error)
        }

        const data = await response.text()
        if (data) {
            return JSON.parse(data)
        }

        return null
    }

    async executeWebhook(
        method: string,
        appId: string,
        token: string,
        parameters: RESTPostAPIWebhookWithTokenJSONBody,
    ) {
        return this.makeRequest<APIWebhook>(Routes.webhookMessage(appId, token), method, parameters)
    }

    async createApplicationCommand(appId: string, command: RESTPostAPIApplicationCommandsJSONBody) {
        return this.makeRequest<APIApplicationCommand>(
            Routes.applicationCommands(appId),
            'POST',
            command,
        )
    }
}
