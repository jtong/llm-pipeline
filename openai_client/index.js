// openai_processor.js
const OpenAI = require('openai');
const {HttpsProxyAgent} = require('https-proxy-agent');


class OpenAIProcessor {
    constructor(apiKey, model) {
        let config = {
            apiKey: apiKey,
        };
        if(process.env.https_proxy){
            config.httpAgent = new HttpsProxyAgent(process.env.https_proxy);
        }
        this.openai = new OpenAI(config);
        this.model = model;
    }


    async processPrompt(prompt) {
        try {
            const chatCompletion = await this.openai.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: this.model,
            });

            let responseText = chatCompletion.choices[0]?.message?.content;

            return responseText.trim();
        } catch (error) {
            console.error('An error occurred:', error);
            throw error;
        }
    }

}

module.exports = OpenAIProcessor;
