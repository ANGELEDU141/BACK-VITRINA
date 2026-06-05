const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let products = [
  { id: 1, name: 'Producto A', price: 10.99 },
  { id: 2, name: 'Producto B', price: 19.99 },
  { id: 3, name: 'Producto C', price: 5.99 }
];

app.get('/products', (req, res) => {
   return res.json(products);
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port} `+ port);
});

