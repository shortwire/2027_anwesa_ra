import { Router } from 'express';
import * as customerController from '../controllers/customer.controller.js';

const router = Router();

router.get('/', customerController.handleGetAllCustomers);
router.get('/:id', customerController.handleGetCustomerById);
router.post('/', customerController.handleCreateCustomer);
router.put('/:id', customerController.handleUpdateCustomer);
router.delete('/:id', customerController.handleDeleteCustomer);
// Additional routes can be added here
// PATCH route (partial update) - ADD THIS
router.patch('/:id', customerController.handlePatchCustomer);

export default router;
