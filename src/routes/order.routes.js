import { Router } from 'express';
import * as orderController from '../controllers/order.controller.js';

const router = Router();

router.get('/', orderController.handleGetAllOrders);
router.get('/:id', orderController.handleGetOrderById);
router.post('/', orderController.handleCreateOrder);
router.put('/:id', orderController.handleUpdateOrder);
router.delete('/:id', orderController.handleDeleteOrder);
// PATCH route (partial update) - ADD THIS
router.patch('/:id', orderController.handlePatchOrder);
export default router;
