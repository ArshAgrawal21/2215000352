const express = require('express');
const axios = require('axios');

const app = express();
const port = 7000;
const windowSize = 10;

const windowState = [];

const numberEndpoints = {
  p: 'http://20.244.56.144/test/primes',
  f: 'http://20.244.56.144/test/fibo',
  e: 'http://20.244.56.144/test/even',
  r: 'http://20.244.56.144/test/rand'
};


async function fetchnumber(url, timeout = 500) {
  try {
    const source = axios.CancelToken.source();
    const timer = setTimeout(() => source.cancel(), timeout);

    const res = await axios.get(url, { cancelToken: source.token });
    clearTimeout(timer);
    return res.data.numbers || [];
  } catch (err) {
    return []; 
  }
}

app.get('/numbers/:numberid', async (req, res) => {
  const numberid = req.params.numberid;
  const url = numberEndpoints[numberid];

  if (!url) return res.status(400).json({ error: 'Invalid number ID' });

  const prevState = [...windowState];
  const fetched = await fetchnumber(url);
  
  fetched.forEach(num => {
    if (!windowState.includes(num)) {
      if (windowState.length >= WINDOW_SIZE) {
        windowState.shift();
      }
      windowState.push(num);
    }
  });

  const avg = windowState.length === 0 ? 0 : (
    windowState.reduce((a, b) => a + b, 0) / windowState.length
  ).toFixed(2);

  res.json({
    windowPrevState: prevState,
    windowCurrState: [...windowState],
    numbers: fetched,
    avg: parseFloat(avg)
  });
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
