
import * as customerService from '../services/customer.service.js';

export async function handleGetAllCustomers(req, res, next) {
  try {
    const customers = await customerService.getAllCustomers();
    res.json(customers);
  } catch (err) {
    next(err);
  }
}

export async function handleGetCustomerById(req, res, next) {
  try {
    const customer = await customerService.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateCustomer(req, res, next) {
  try {
    const newCustomer = await customerService.createCustomer(req.body);
    res.status(201).json(newCustomer);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateCustomer(req, res, next) {
  try {
    const success = await customerService.updateCustomer(req.params.id, req.body);
    if (!success) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    next(err);
  }
}
//extra function for patch
export async function handlePatchCustomer(req, res, next) {
  try {
    const updated = await customerService.patchCustomer(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    next(err);
  }
}


export async function handleDeleteCustomer(req, res, next) {
  try {
    const success = await customerService.deleteCustomer(req.params.id);
    if (!success) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    next(err);
  }
}
