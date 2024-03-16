const { expect } = require('chai');
const OpenAIProcessorInstance = require('../factory');
const fs = require("fs");
const path = require("path");
const casesDirectory = "openai_client/test/cases";


function clearDirectory(directoryPath) {
    if (fs.existsSync(directoryPath)) {
        const files = fs.readdirSync(directoryPath);
        for (const file of files) {
            fs.unlinkSync(path.join(directoryPath, file));
        }
    }
}

describe('OpenAI Simulated Response Test', function() {
    it('should return the simulated response from the specified json recording when simulation is enabled', async function() {
        // 模拟环境变量设置
        this.timeout(10000);

        const simulatedAPIKey = process.env.OPENAI_API_KEY;
        const simulatedModel = 'gpt-3.5-turbo';
        const simulateOnly = "true"; // 打开模拟开关
        const simulatorPath = path.join(__dirname, 'cases/case1/simulator'); // 指定模拟器记录的路径

        // 设置环境变量
        process.env.OPENAI_SIMULATE_ONLY = simulateOnly;
        process.env.OPENAI_API_KEY = simulatedAPIKey;
        process.env.OPENAI_SIMULATOR_PATH = simulatorPath;

        // 创建模拟的 OpenAI 处理器实例
        const openAIProcessor = OpenAIProcessorInstance.getSimulatedOpenAIProcessor(simulatedAPIKey, simulatedModel);
        // 模拟消息处理
        // 输入应与 recording_1.json 中的输入相匹配
        expect(await openAIProcessor.processPrompt([{role: "user", content: "这是测试提示"}]))
            .to.equal('这是预期响应');

        expect(await openAIProcessor.processPrompt([{role: "user", content: "这是测试提示2"}]))
            .to.equal('这是预期响应2');
    });
});

describe('OpenAI Response Recording Test', function() {
    const simulatorPath = path.join(__dirname, 'cases/case2/simulator');

    beforeEach(function() {
        // 确保模拟器路径存在
        if (!fs.existsSync(simulatorPath)) {
            fs.mkdirSync(simulatorPath, { recursive: true });
        }
        // 清除模拟器路径中的记录文件
        clearDirectory(simulatorPath);
    });

    it('should record OpenAI responses to a file if IS_RECORDING_OPENAI is true', async function() {
        // 模拟环境变量设置
        this.timeout(10000);

        const simulatedAPIKey = process.env.OPENAI_API_KEY;
        const simulatedModel = 'gpt-3.5-turbo';
        const simulateOnly = "false";
        const isRecording = "true";

        // 设置环境变量
        process.env.OPENAI_SIMULATE_ONLY = simulateOnly;
        process.env.IS_RECORDING_OPENAI = isRecording;
        process.env.OPENAI_SIMULATOR_PATH = simulatorPath;

        // 创建模拟的 OpenAI 处理器实例
        const openAIProcessor = OpenAIProcessorInstance.getSimulatedOpenAIProcessor(simulatedAPIKey, simulatedModel);
        openAIProcessor.clearRecordings();
        // 模拟消息处理
        const messages = [
            { role: "user", content: "小明的爸爸只有三个儿子，老大叫大毛，老二叫二毛，老三叫什么？" }
        ];
        const response = await openAIProcessor.processMessages(messages);
        openAIProcessor.saveRecordings();

        // 验证是否有记录文件被创建
        const recordedFiles = fs.readdirSync(simulatorPath);
        expect(recordedFiles).to.have.lengthOf(1);

        // 验证记录文件内容
        recordedFiles.forEach(file => {
            const recordingData = JSON.parse(fs.readFileSync(path.join(simulatorPath, file), 'utf8'));
            expect(recordingData.input).to.equal(JSON.stringify(messages));
            expect(recordingData.output).to.equal(response);
        });
    });
    it('should record multiple OpenAI responses to multiple files if IS_RECORDING_OPENAI is true', async function() {
        // 模拟环境变量设置
        this.timeout(20000);

        const simulatedAPIKey = process.env.OPENAI_API_KEY;
        const simulatedModel = 'gpt-3.5-turbo';
        const simulateOnly = "false";
        const isRecording = "true";

        // 设置环境变量
        process.env.OPENAI_SIMULATE_ONLY = simulateOnly;
        process.env.IS_RECORDING_OPENAI = isRecording;
        process.env.OPENAI_SIMULATOR_PATH = simulatorPath;

        // 创建模拟的 OpenAI 处理器实例
        const openAIProcessor = OpenAIProcessorInstance.getSimulatedOpenAIProcessor(simulatedAPIKey, simulatedModel);
        openAIProcessor.clearRecordings();
        // 模拟多轮消息处理
        const messagesRound1 = [
            { role: "user", content: "这是第一轮测试提示" }
        ];
        const messagesRound2 = [
            { role: "user", content: "这是第二轮测试提示" }
        ];

        // 处理第一轮消息
        const responseRound1 = await openAIProcessor.processMessages(messagesRound1);
        // 处理第二轮消息
        const responseRound2 = await openAIProcessor.processMessages(messagesRound2);

        // 存储录制
        openAIProcessor.saveRecordings();

        // 验证是否有多个记录文件被创建
        const recordedFiles = fs.readdirSync(simulatorPath);
        expect(recordedFiles).to.have.lengthOf.at.least(2); // 至少有两个文件

        // 验证记录文件内容
        recordedFiles.forEach(file => {
            const recordingData = JSON.parse(fs.readFileSync(path.join(simulatorPath, file), 'utf8'));
            expect(recordingData.input).to.be.oneOf([JSON.stringify(messagesRound1), JSON.stringify(messagesRound2)]);
            expect(recordingData.output).to.be.oneOf([responseRound1, responseRound2]);
        });
    });
});