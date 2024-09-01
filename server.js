const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Load existing scores or initialize an empty array
let scores = [];
if (fs.existsSync('scores.json')) {
    scores = JSON.parse(fs.readFileSync('scores.json'));
}

// Endpoint to get all scores (sorted by highest score first)
app.get('/scores', (req, res) => {
    const sortedScores = scores.sort((a, b) => b.score - a.score);  // Sort by score in descending order
    res.json(sortedScores);
});

// Endpoint to save a new score
app.post('/scores', (req, res) => {
    const { name, score } = req.body;
    if (name && typeof score === 'number') {
        scores.push({ name, score });

        // Save scores to a file
        fs.writeFileSync('scores.json', JSON.stringify(scores, null, 2));
        res.status(201).json({ message: 'Score saved successfully!' });
    } else {
        res.status(400).json({ message: 'Invalid data provided' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
