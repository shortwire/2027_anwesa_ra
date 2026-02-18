import express from 'express';
import morgan from 'morgan';
import itemRoutes from './routes/item.routes.js';
import customerRoutes from './routes/customer.routes.js';
import orderRoutes from './routes/order.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

export const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());

// Assessment2: CORS Middleware - Allows the frontend to communicate with the API from a different origin
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // If the request has an origin, we reflect it back instead of using '*'
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight (OPTIONS) requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});


// Routes
app.use('/api/items', itemRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);

// Error handling
app.use(errorHandler);
