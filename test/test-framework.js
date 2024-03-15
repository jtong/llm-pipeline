const { expect } = require('chai');
const fs = require('fs');
const path = require('path');
const { describe, it } = require('mocha');
const yaml = require('js-yaml');

const workspaceRoot = path.resolve(__dirname, "../");
function getTestCases(dir) {
    const testCases = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);

        if (stats.isDirectory()) {
            testCases.push(...getTestCases(filePath));
        } else if (file.endsWith('.yaml')) {
            testCases.push({ filePath, dir });
        }
    }

    return testCases;
}
exports.runTests = function(config) {
    const testcaseDirectory = config.isDebugMode ? path.resolve(workspaceRoot, config.casesDirectory, 'debug') : path.resolve(config.casesDirectory);
    const testCases = getTestCases(testcaseDirectory);

    // const testFiles = fs.readdirSync(path.resolve(workspaceRoot, testcaseDirectory)).filter(file => file.endsWith('.yaml'));

    describe('Data Driven Tests', function () {
        testCases.forEach(({filePath,dir}) => {
            const testCase = yaml.load(fs.readFileSync(filePath, 'utf8'));

            it(testCase.desc, async function () {
                this.timeout(10000);

                // 执行前置钩子
                if (config.beforeCaseHook && testCase.given.executeBeforeCaseHook) {
                    await config.beforeCaseHook(testCase, dir, filePath);
                }

                const result = await config.testFunction(testCase.given);

                // 执行后置钩子
                if (config.afterCaseHook && testCase.given.executeAfterCaseHook) {
                    await config.afterCaseHook(result, testCase, dir, filePath);
                }

                // 如果提供了自定义验证函数，则使用它进行验证
                if (config.customValidator) {
                    config.customValidator(result, testCase);
                } else {
                    // 否则使用默认验证逻辑
                    validateResult(result, testCase);
                }
            });
        });
    });
};

function validateResult(result, testCase) {
    const { then } = testCase;
    Object.keys(then).forEach(key => {
        if (key === 'ruleMatch') {
            handleRuleMatch(result, then[key]);
        } else {
            // 对于除ruleMatch外的其他键进行默认相等验证
            expect(result[key]).to.deep.equal(then[key]);
        }
    });
}

function handleRuleMatch(result, rules) {
    // 处理ruleMatch规则
    rules.forEach(rule => {
        // 根据rule.type处理不同的验证逻辑
        switch (rule.type) {
            case "lengthNotGreaterThan":
                const targetValue = result[rule.target];
                expect(targetValue.length, `Expected length of '${rule.target}' to be at most ${rule.value}, but got ${targetValue.length}`).to.be.at.most(rule.value);
                break;
            case "lengthGreaterThan":
                const targetValueForGreaterThanZero = result[rule.target];
                expect(targetValueForGreaterThanZero.length, `Expected length of '${rule.target}' to be greater than 0, but got ${targetValueForGreaterThanZero.length}`).to.be.greaterThan(rule.value);
                break;
            case "stringEqualsIgnoreCase":
                const actualValue = result[rule.target];
                const expectedValue = rule.value;
                expect(actualValue.toLowerCase(), `Expected '${rule.target}' to equal '${expectedValue}' ignoring case, but got '${actualValue}'`).to.equal(expectedValue.toLowerCase());
                break;
            // 添加更多规则类型的处理逻辑
            default:
                console.log(result)
                throw new Error(`Unhandled rule type: ${rule.type}`);
        }
    });
}
