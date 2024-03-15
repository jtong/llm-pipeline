const { expect } = require('chai');
const { runTests } = require('test/test-framework.js');
const OpenAIProcessorInstance = require('../factory');
const fs = require("fs");
const path = require("path");
const casesDirectory = "openai_client/test/cases";

const clearSimulatorFolder = (simulatorPath) => {
    if (fs.existsSync(simulatorPath)) {
        const files = fs.readdirSync(simulatorPath);
        for (const file of files) {
            fs.unlinkSync(path.join(simulatorPath, file));
        }
    }
}



describe('OpenAI Simulator Tests', function() {
    const config = {
        casesDirectory,
        testFunction: async (given) => {
            process.env.OPENAI_SIMULATOR_PATH = path.resolve(__dirname, 'cases', given.simulatorPath); // 设置模拟器路径
            process.env.OPENAI_SIMULATE_ONLY = given.OPENAI_SIMULATE_ONLY; // 设置模拟器路径
            process.env.OPENAI_USE_RECORDING = given.OPENAI_USE_RECORDING; // 设置记录模式

            const simulatorPath = process.env.OPENAI_SIMULATOR_PATH;
            const openAIProcessor = OpenAIProcessorInstance.getSimulatedOpenAIProcessor(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-16k', simulatorPath);

            // 使用给定的消息处理
            const response = await openAIProcessor.processMessages(given.messages);

            if(given.isSaveRecording){
                openAIProcessor.saveRecordings();
            }

            // 返回测试结果
            return {
                response,
                simulatorPath: given.simulatorPath // 将simulatorPath作为键值对返回
            };
        },
        customValidator: (result, testCase) => {
        },
        beforeTestHook: (testCase, dir, filePath) => {
            console.log(dir);
            const simulatorPath = path.resolve(__dirname, 'cases', testCase.given.simulatorPath);
            clearSimulatorFolder(simulatorPath);
        },
        afterTestHook: (result, testCase, dir, filePath) => {
            // 在这里执行任何需要的后置逻辑
        },
        isDebugMode: process.env.DEBUG_MODE === 'true'
    };

    runTests(config);
});