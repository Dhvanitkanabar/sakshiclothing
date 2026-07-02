import addressService from '../services/address.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const addAddress = asyncHandler(async (req, res) => {
  const address = await addressService.addAddress(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, address, 'Address added successfully'));
});

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await addressService.getUserAddresses(req.user._id);
  return res.status(200).json(new ApiResponse(200, addresses, 'Addresses fetched successfully'));
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await addressService.updateAddress(req.params.id, req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, address, 'Address updated successfully'));
});

export const deleteAddress = asyncHandler(async (req, res) => {
  await addressService.deleteAddress(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, null, 'Address deleted successfully'));
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await addressService.setDefaultAddress(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, address, 'Default address set successfully'));
});
