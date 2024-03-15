const OpenAIProcessor = require('./index');
const SimulatedOpenAIProcessorDecorator = require('./simulator');

class OpenAIProcessorInstance {
    constructor() {
        this.openAIProcessors = {};
        this.simulatedOpenAIProcessors = {};
    }

    getOpenAIProcessor(apiKey, model) {
        const key = `${apiKey}-${model}`;
        if (!this.openAIProcessors[key]) {
            this.openAIProcessors[key] = new OpenAIProcessor(apiKey, model);
        }
        return this.openAIProcessors[key];
    }

    getSimulatedOpenAIProcessor(apiKey, model, simulatorPath) {
        const key = `${apiKey}-${model}-${simulatorPath}`;
        if (!this.simulatedOpenAIProcessors[key]) {
            const openAIProcessor = this.getOpenAIProcessor(apiKey, model);
            this.simulatedOpenAIProcessors[key] = new SimulatedOpenAIProcessorDecorator(openAIProcessor, simulatorPath);
        }
        return this.simulatedOpenAIProcessors[key];
    }
}

const instance = new OpenAIProcessorInstance();
Object.freeze(instance);

module.exports = instance;