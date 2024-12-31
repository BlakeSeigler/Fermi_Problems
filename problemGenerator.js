const { OpenAI } = require('openai');  
require('dotenv').config();

// Initialize OpenAI API client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

// This function will be exported for use in server.js, it returns the String for a new fermi problem
async function getRandomFermiProblem() {
    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an assistant that generates a random realistic Fermi problem for business, economics, politics, or STEM when asked. Only say ok.',
                },
                {
                    role: 'user',
                    content: 'Please generate a random and never seen before Fermi problem and only state the problem.',
                },
            ],
        });

        const problem = response.choices[0].message.content.trim().replace(/^Ok\.\s*/, '');
        return problem;
    } catch (error) {
        console.error('Error fetching Fermi problem:', error);
        throw new Error('Failed to fetch Fermi problem');
    }
}

module.exports = { getRandomFermiProblem };
