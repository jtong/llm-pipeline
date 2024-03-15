class OpenAIProcessorDecorator {
    constructor(openAIProcessor) {
        this.openAIProcessor = openAIProcessor;
    }

    async processPrompt(prompt) {
        return this.openAIProcessor.processPrompt(prompt);
    }

    async processMessages(messages) {
        return this.openAIProcessor.processMessages(messages);
    }
}

module.exports = OpenAIProcessorDecorator;