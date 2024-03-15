const { expect } = require('chai');
const { runTests } = require('test/test-framework.js');
const OpenAIProcessorInstance = require('../factory');
const fs = require("fs");
const path = require("path");
const casesDirectory = "openai_client/test/cases";


describe('OpenAI Simulator Tests', function() {
    const config = {
        casesDirectory,
        testFunction: async (given) => {
            process.env.OPENAI_SIMULATOR_PATH = path.resolve(__dirname, 'cases', given.simulatorPath); // 设置模拟器路径
            process.env.OPENAI_SIMULATE_ONLY = given.OPENAI_SIMULATE_ONLY; // 设置模拟器路径
            process.env.OPENAI_USE_RECORDING = given.OPENAI_USE_RECORDING; // 设置记录模式

            let messages = [{ role: 'user', content: given.prompt }];

            const simulatorPath = process.env.OPENAI_SIMULATOR_PATH;
            const openAIProcessor = OpenAIProcessorInstance.getSimulatedOpenAIProcessor(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-16k', simulatorPath);
            const response = await openAIProcessor.processMessages(messages);

            return {
                response,
                simulatorPath: given.simulatorPath // 将simulatorPath作为键值对返回
            };
        },
        isDebugMode: process.env.DEBUG_MODE === 'true',
        customValidator: (result, testCase) => {
            expect(result.response).to.equal(testCase.then.response);
        }
    };

    runTests(config);
});