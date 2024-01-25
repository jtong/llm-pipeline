const { Pipe, Pipeline } = require('./pipelines');
const OpenAIProcessor = require('./openai_client');
const fs = require('fs').promises;
const yaml = require('js-yaml');
var {parseStringPromise} = require('xml2js');
const path = require("path");
const ejs = require('ejs');

const openai_key = process.env.OPENAI_API_KEY
const openAIProcessor = new OpenAIProcessor(openai_key, 'gpt-3.5-turbo-16k');

async function data_element_post_process(response) {
    const match = response.match(/<data>[\s\S]*?<\/data>/);
    const xmlContent = match ? match[0] : '';
    // console.log(xmlContent)

    // 解析XML并提取text content
    const result = await parseStringPromise(xmlContent);
    // console.log(result);
    return result.data;
}


module.exports = {
    render_ejs_template_pipe : new Pipe(async (input) => {
        const rendered = await ejs.renderFile(input.ejs.ejsTemplatePath, input);
        return rendered;
    }),
    interactWithOpenAI_pipe : new Pipe(async (input) => {
        // 这里是与OpenAI交互的逻辑
        return await openAIProcessor.processPrompt(input);
    }),
    post_data_xml_element_pipe: new Pipe(async (input) => {
        // 这里是XML解析的逻辑
        // 截取<data>和</data>之间的内容（包含data标签）
        return await data_element_post_process(input);
    }),
    empty_pipe : new Pipe(async(input) => input )
}


