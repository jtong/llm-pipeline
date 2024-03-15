const OpenAIProcessor = require('./index');
const SimulatedOpenAIProcessorDecorator = require('./simulator');

class OpenAIProcessorFactory {
    static createProcessor(apiKey, model) {
        const openAIProcessor = new OpenAIProcessor(apiKey, model);

        // 检查是否需要启用仿真功能
        const simulatorPath = process.env.OPENAI_SIMULATOR_PATH;
        if (simulatorPath) {
            return new SimulatedOpenAIProcessorDecorator(openAIProcessor, simulatorPath);
        }

        return openAIProcessor;
    }
}

module.exports = OpenAIProcessorFactory;