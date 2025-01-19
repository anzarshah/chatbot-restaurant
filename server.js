import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import openai from './config/open-ai.js';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const menuData = JSON.parse(fs.readFileSync('./public/menu.json', 'utf-8'));

app.post('/chat', async (req, res) => {
  const { message, isFirstInteraction } = req.body; // Add `isFirstInteraction` to the request body

  try {
    const systemMessage = isFirstInteraction
      ? `You are a smart and friendly restaurant assistant for "Bawarchi Biryanis". Start the conversation with a warm greeting like "Welcome to Bawarchi Biryanis! How can I assist you today?". Use the following restaurant information to answer questions about the menu, location, hours, and other services:`
      : `You are a smart and friendly restaurant assistant for "Bawarchi Biryanis". Continue assisting the user without repeating the initial greeting. Use the following restaurant information to answer questions about the menu, location, hours, and other services:`;

    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `${systemMessage}
          - **Restaurant Name**: Bawarchi Biryanis
          - **Address**: 1801 N Greenville Ave, 250, Richardson, TX 75081
          - **Phone Number**: (972) 474-8844
          - **Hours**: Monday: Closed; Tuesday-Friday: 11AM–9PM; Saturday: 9AM–10PM; Sunday: 9AM–9PM.
  
          You can help customers:
          1. Explore the menu and recommend dishes based on preferences like vegan, spicy, or kids' meals.
          2. Provide information about the restaurant's hours, location, and party tray services.
          3. Suggest pairings and describe dishes in detail.

          Here is the updated menu: ${JSON.stringify(menuData)}. Answer in a conversational tone, and feel free to add helpful suggestions or clarifications.`
        },
        { role: 'user', content: message }
      ]
    });

    res.json({ response: completion.data.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
