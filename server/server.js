const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/search', async (req, res) => {
    const query = req.query.query;
    
    try {
      const novelsSnapshot = await db.collection('novels')
        .where('title', '>=', query)
        .where('title', '<=', query + '\uf8ff')
        .get();
      
      const novels = novelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      res.render('dashboard', { novels });
    } catch (error) {
      res.status(500).send('Error occurred while searching for novels:', error);
    }
  });

  app.post('/add-to-cart', (req, res) => {
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    const novelId = req.body.novelId;
    req.session.cart.push(novelId);
    
    res.redirect('/dashboard');
  });

  app.get('/cart', async (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
      return res.render('cart', { cartNovels: [] });
    }
    
    const novelsSnapshot = await db.collection('novels').where(admin.firestore.FieldPath.documentId(), 'in', req.session.cart).get();
    const cartNovels = novelsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    res.render('cart', { cartNovels });
  });
  
  app.post('/checkout', (req, res) => {
    // Implement checkout logic here
    
    // Clear the cart
    req.session.cart = [];
    res.redirect('/dashboard');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
