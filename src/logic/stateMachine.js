import { request } from '../api/client.js';

// Posts
export async function getAllPosts() {
  // Assuming GET /api/v1/admin/posts or GET /api/v1/posts without filters for all posts
  return request('GET', '/posts', { query: { availableOnly: false } });
}

export async function getAvailablePosts() {
  return request('GET', '/posts');
}

export async function getPostById(id) {
  return request('GET', `/posts/${id}`);
}

export async function createPost(postData) {
  return request('POST', '/posts', { body: postData });
}

// Users
export async function getAllUsers() {
  return request('GET', '/users');
}

export async function getUserById(id) {
  return request('GET', `/users/${id}`);
}

// Requests
export async function submitRequest(postId, borrowerId, requestData) {
  // requestData: { start, end, message, agreementAccepted, dropoffLocationId }
  return request('POST', `/posts/${postId}/requests`, { body: requestData });
}

export async function getRequestsByBorrower(borrowerId) {
  return request('GET', '/requests/mine');
}

export async function getRequestsByPost(postId) {
  return request('GET', `/posts/${postId}/requests`);
}

export async function acceptRequest(requestId) {
  return request('POST', `/requests/${requestId}/accept`);
}

export async function rejectRequest(requestId, reason) {
  return request('POST', `/requests/${requestId}/reject`, { body: { reason } });
}

// Exchanges
export async function getExchangesByOwner(ownerId) {
  return request('GET', '/exchanges/mine', { query: { role: 'owner' } });
}

export async function getExchangesByBorrower(borrowerId) {
  return request('GET', '/exchanges/mine', { query: { role: 'borrower' } });
}

export async function getExchangeById(id) {
  return request('GET', `/exchanges/${id}`);
}

// State Machine transitions
export async function confirmDepositPaid(exchangeId, dropoffLocationId) {
  return request('POST', `/exchanges/${exchangeId}/pay`, { body: { dropoffLocationId } });
}

export async function markHandover(exchangeId, handoverData) {
  // handoverData: { conditionBefore, photoIds }
  return request('POST', `/exchanges/${exchangeId}/handover`, { body: handoverData });
}

export async function markReturned(exchangeId, returnData) {
  // returnData: { notes, photoIds }
  return request('POST', `/exchanges/${exchangeId}/return`, { body: returnData });
}

export async function markInspected(exchangeId, inspectionData) {
  // inspectionData: { conditionAfter, photoIds, damage }
  return request('POST', `/exchanges/${exchangeId}/inspect`, { body: inspectionData });
}

export async function submitRating(exchangeId, ratingData) {
  // ratingData: { rating, review }
  return request('POST', `/exchanges/${exchangeId}/rate`, { body: ratingData });
}

// Complaints / Disputes
export async function raiseComplaint(exchangeId, complaintData) {
  // complaintData: { kind, reason, claimedAmount, photoIds }
  return request('POST', `/exchanges/${exchangeId}/report`, { body: complaintData });
}

// Impact
export async function getCampusImpactStats() {
  return request('GET', '/impact');
}
