import { Router } from 'express';
import * as itemController from '../controllers/item.controller.js';

const router = Router();

router.get('/', itemController.handleGetAllItems);
router.get('/discounts/all', itemController.handleGetAllDiscounts); // Must come before /:id
router.post('/', itemController.handleCreateItem);
router.get('/:id', itemController.handleGetItemById); // Generic :id route must come after specific routes
router.put('/:id', itemController.handleUpdateItem);
router.patch('/:id', itemController.handlePatchItem);
router.delete('/:id', itemController.handleDeleteItem);
export default router;
