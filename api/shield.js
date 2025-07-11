const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const message = req.body.message || '';

  // Load words from JSON file
  const filterPath = path.join(__dirname, 'shield_filter_words.json');
  const censoredWords = JSON.parse(fs.readFileSync(filterPath, 'utf-8'));

  let count = 0;
  let shielded = message;

  censoredWords.forEach(word => {
    const regex = new RegExp(word, 'gi');
    if (regex.test(shielded)) {
      const matches = shielded.match(regex) || [];
      count += matches.length;
      shielded = shielded.replace(regex, '🛡️');
    }
  });

  res.status(200).json({ shielded, count });
};