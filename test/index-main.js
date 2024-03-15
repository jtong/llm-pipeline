// testConfig.js
const { runTests } = require('./test-framework.js');
const path = require('path');

const { tokenLimit,
    workspaceRoot,
    configPath,
    get_api_doc_path } = require("../agent_config");

const casesDirectory= "test/cases";

const config = {
    casesDirectory,
    testFunction: async (given) => {
        const inputFilePath = path.resolve(workspaceRoot, casesDirectory, given.input_file);
        const inputContent = require(inputFilePath);

        const {FormSenderReplyAgent} = require("../agent.js");
        const agent = new FormSenderReplyAgent();
        return await agent.execute("", inputContent);
    },
    isDebugMode: process.env.DEBUG_MODE === 'true',
    // 可选的自定义验证函数
    customValidator: (result, testCase) => {
        // 用户可以在这里添加自定义验证逻辑，如果需要的话
    }
};

runTests(config);
