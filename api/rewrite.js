const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { message, tone } = JSON.parse(body);

      const prompt = `Rewrite the following message with a tone of ${tone}:\n\n"${message}"`;

      const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await openaiRes.json();

      // 🔍 Log full OpenAI response for debugging
      console.log('Full OpenAI API response:', JSON.stringify(data, null, 2));
      console.log('Using API Key:', process.env.OPENAI_API_KEY ? 'Yes' : 'Missing');
      console.log('Prompt:', prompt);

      const reply = data.choices?.[0]?.message?.content ?? 'Error: no response.';

      res.status(200).json({ result: reply });
    } catch (err) {
      console.error('OpenAI error:', err);
      res.status(500).json({ error: 'OpenAI call failed.' });
    }
  });
};