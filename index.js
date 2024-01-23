const common_pipes = require("./common_pipes")
const pipelines = require('./pipelines');
const openai_client = require("./openai_client");

module.exports = {
    common_pipes,
    pipelines,
    clients: {
        openai_client
    }
};