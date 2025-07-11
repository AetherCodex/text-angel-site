const fetch = require('node-fetch');

module.exports = async (req, res) => {
  console.log('🔥 Incoming request to /api/rewrite');

  if (req.method !== 'POST') {
    console.warn('⚠️ Method not allowed:', req.method);
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      console.log('📩 Raw request body:', body);

      const { message, tone } = JSON.parse(body);
      console.log('📝 Message:', message);
      console.log('🎨 Tone:', tone);

      const prompt = `Rewrite the following message with a tone of ${tone}:\n\n"${message}"`;
      console.log('🧠 Prompt to OpenAI:', prompt);

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

      // 🔍 Deep logging
      console.log('📦 Full OpenAI response:', JSON.stringify(data, null, 2));
      console.log('🔐 API Key Present:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');

      const reply = data.choices?.[0]?.message?.content;

      if (!reply) {
        console.error('⚠️ OpenAI returned no valid message:', data);
        return res.status(502).json({ error: 'No valid response from OpenAI', data });
      }

      res.status(200).json({ result: reply });
    } catch (err) {
      console.error('❌ Rewrite Function Error:', err);
      res.status(500).json({ error: 'OpenAI call failed.', details: err.message });
    }
  });
};
