exports.handler = async (event, context) => {
    const apiKey = process.env.API_KEY;
    // Use apiKey for your logic
    return {
        statusCode: 200,
        body: JSON.stringify({ apiKey })
    };
};
