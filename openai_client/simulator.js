const fs = require('fs');
const path = require('path');

const OpenAIProcessorDecorator = require("./decorator")
function readRecordings(recordPath) {
    const recordings = [];
    const files = fs.readdirSync(recordPath);

    files.forEach(file => {
        if (file.startsWith('recording_') && file.endsWith('.json')) {
            const filePath = path.join(recordPath, file);
            const recording = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            recordings.push(recording);
        }
    });

    return recordings;
}

function getSimulatedResponse(recordings, messages) {
    const inputString = JSON.stringify(messages);

    const match = recordings.find(recording => recording.input === inputString);
    if (match) {
        return match.output;
    }

    // 如果没有找到匹配的录制数据,可以返回一个默认值或抛出错误
    return 'No matching recording found.';
}

class SimulatedOpenAIProcessorDecorator extends OpenAIProcessorDecorator {
    constructor(openAIProcessor, recordPath) {
        super(openAIProcessor);
        this.recordPath = recordPath;
        this.recordings = readRecordings(recordPath);
    }

    async processPrompt(prompt) {
        if (this.recordings) {
            const response = getSimulatedResponse(this.recordings, prompt);
            return response.trim();
        } else {
            return super.processPrompt(prompt);
        }
    }

    async processMessages(messages) {
        const inputString = JSON.stringify(messages);
        const simulateOnly = process.env.OPENAI_SIMULATE_ONLY === 'true';
        const useRecording = process.env.OPENAI_USE_RECORDING === 'true';

        if (simulateOnly) {
            const simulatedResponse = getSimulatedResponse(this.recordings, messages);
            return simulatedResponse;
        }

        const outputString = await super.processMessages(messages);

        // 根据 useRecording 决定是否记录请求和响应
        if (useRecording) {
            this.recordings.push({ input: inputString, output: outputString });
        }

        return outputString;
    }

    saveRecordings() {
        if (!this.recordPath) {
            console.warn('No record path specified, recordings will not be saved.');
            return;
        }

        if (!fs.existsSync(this.recordPath)) {
            fs.mkdirSync(this.recordPath, { recursive: true });
        }

        this.recordings.forEach((recording, index) => {
            const filePath = path.join(this.recordPath, `recording_${index}.json`);
            fs.writeFileSync(filePath, JSON.stringify(recording));
        });
    }
}

module.exports = SimulatedOpenAIProcessorDecorator;
