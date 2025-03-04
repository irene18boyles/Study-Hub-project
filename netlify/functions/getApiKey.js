// .netlify/functions/getApiKey.js

exports.handler = async function(event, context) {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "API Key is missing" })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ API_KEY: apiKey })
    };
};
