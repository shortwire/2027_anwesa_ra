import * as orderService from '../services/order.service.js';

export async function handleGetAllOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders();
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function handleGetOrderById(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateOrder(req, res, next) {
  try {
    const newOrder = await orderService.createOrder(req.body);
    res.status(201).json(newOrder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

export async function handleUpdateOrder(req, res, next) {
  try {
    const success = await orderService.updateOrder(req.params.id, req.body);
    if (!success) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    next(err);
  }
}

//extra function for patch
export async function handlePatchOrder(req, res, next) {
  try {
    const success = await orderService.PatchOrder(req.params.id, req.body);
    if (!success) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order updated successfully' });
  } catch (err) {
    next(err);
  }
}
export async function handleDeleteOrder(req, res, next) {
  try {
    const success = await orderService.deleteOrder(req.params.id);
    if (!success) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    next(err);
  }
}
