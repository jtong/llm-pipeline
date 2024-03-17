const common_pipes = require("./common_pipes")
const pipelines = require('./pipelines');
const openai_client = require("./openai_client");
const openai_client_factory = require("./openai_client/factory");

module.exports = {
    common_pipes,
    pipelines,
    clients: {
        openai_client,
        openai_client_factory
    }
};