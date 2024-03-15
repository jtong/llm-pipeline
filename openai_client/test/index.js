const { expect } = require('chai');
const { runTests } = require('test/test-framework.js');
const OpenAIProcessorFactory = require('../factory');
const fs = require("fs");
const path = require("path");
const casesDirectory = "openai_client/test/cases";

describe('OpenAI Simulator Tests', function() {
    const config = {
        casesDirectory,
        testFunction: async (given) => {
            process.env.OPENAI_SIMULATOR_PATH = path.resolve(__dirname, 'cases/simulator'); // 设置模拟器路径
            process.env.OPENAI_SIMULATE_ONLY = "true"; // 设置模拟器路径
            // 清理模拟器录制文件

            const simulatorPath = process.env.OPENAI_SIMULATOR_PATH;
            const simulatorFiles = fs.readdirSync(simulatorPath);
            simulatorFiles.forEach(file => {
                if (file.startsWith('recording_')) {
                    fs.unlinkSync(path.join(simulatorPath, file));
                }
            });

            let messages = [{ role: 'user', content: given.prompt }];

            // 添加期望的响应到模拟器 (如果指定了)
            if (given.recording) {
                const recording = {
                    input: JSON.stringify(messages),
                    output: given.recording.output
                };
                fs.writeFileSync(path.join(simulatorPath, 'recording_1.json'), JSON.stringify(recording));
            }

            const openAIProcessor = OpenAIProcessorFactory.createProcessor(process.env.OPENAI_API_KEY, 'gpt-3.5-turbo-16k');
            // 运行测试
            const response = await openAIProcessor.processMessages(messages);
            return response;
        },
        isDebugMode: process.env.DEBUG_MODE === 'true',
        customValidator: (result, testCase) => {
            expect(result).to.equal(testCase.then.expectedResponse);
        }
    };

    runTests(config);
});