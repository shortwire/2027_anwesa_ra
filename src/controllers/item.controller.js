import * as itemService from '../services/item.service.js';
import { createItemDiscount } from '../utils/discount.js';

export async function handleGetAllItems(req, res, next) {
  try {
    const items = await itemService.getAllItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

export async function handleGetItemById(req, res, next) {
  try {
    const item = await itemService.getItemById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

export async function handleCreateItem(req, res, next) {
  try {
    const newItem = await itemService.createItem(req.body);
    
    // Automatically create discount entry in discou24 table for new item
    const { ItemID, ItemDesc } = newItem;
    const discountPercentage = req.body.discountPercentage || 0; // Default to 0% if not provided
    
    try {
      await createItemDiscount({
        itemId: ItemID,
        discountPercentage: discountPercentage,
        description: `Discount for ${ItemDesc}`
      });
    } catch (discountErr) {
      console.error('Warning: Could not create discount entry for new item:', discountErr);
      // Don't fail the item creation if discount entry fails
    }
    
    res.status(201).json(newItem);
  } catch (err) {
    next(err);
  }
}

export async function handleUpdateItem(req, res, next) {
  try {
    const success = await itemService.updateItem(req.params.id, req.body);
    if (!success) return res.status(404).json({ message: 'Item not found' });
    
    // Update discount if provided in request body
    if (req.body.discountPercentage !== undefined) {
      try {
        await createItemDiscount({
          itemId: req.params.id,
          discountPercentage: req.body.discountPercentage,
          description: `Discount for Item ${req.params.id}`
        });
      } catch (discountErr) {
        console.error('Warning: Could not update discount entry:', discountErr);
      }
    }
    
    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    next(err);
  }
}
//extra function for patch
export async function handlePatchItem(req, res, next) {
  try {
    const success = await itemService.patchItem(req.params.id, req.body);
    if (!success) return res.status(404).json({ message: 'Item not found' });
    
    // Update discount if provided in request body
    if (req.body.discountPercentage !== undefined) {
      try {
        await createItemDiscount({
          itemId: req.params.id,
          discountPercentage: req.body.discountPercentage,
          description: `Discount for Item ${req.params.id}`
        });
      } catch (discountErr) {
        console.error('Warning: Could not update discount entry:', discountErr);
      }
    }
    
    res.json({ message: 'Item updated successfully' });
  } catch (err) {
    next(err);
  }
}

export async function handleDeleteItem(req, res, next) {
  try {
    const success = await itemService.deleteItem(req.params.id);
    if (!success) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    next(err);
  }
}

export async function handleGetAllDiscounts(req, res, next) {
  try {
    const discounts = await itemService.getAllDiscounts();
    res.json(discounts);
  } catch (err) {
    next(err);
  }
}
