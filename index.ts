import express from 'express';

const app = express();
app.use(express.json());

app.get('/status', (req, res) => {
  res.send({ status: 'Abstract Schemes Service Running' });
});

app.listen(3000, () => {
  console.log('Service running on port 3000');
});