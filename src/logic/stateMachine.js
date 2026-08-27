import { initDB } from '../db/schema';

export const PLATFORM_FEE_PERCENT = 0.08; // 8% of borrowingCost, flat rate for the demo

/**
 * Computes platform fee (8% of borrowing cost, rounded to 2 decimal places)
 */
export function computePlatformFee(borrowingCost) {
  return Math.round(Number(borrowingCost || 0) * PLATFORM_FEE_PERCENT * 100) / 100;
}

/**
 * Creates a new post in the 'posts' object store.
 * @param {Object} data - { ownerId, title, channel, itemName, description, borrowingCost, securityDeposit, location }
 */
export async function createPost(data) {
  const db = await initDB();
  const post = {
    id: 'post-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    ownerId: data.ownerId,
    title: data.title,
    channel: data.channel,
    itemName: data.itemName,
    description: data.description || '',
    borrowingCost: Number(data.borrowingCost || 0),
    securityDeposit: Number(data.securityDeposit || 0),
    location: data.location?.trim() || 'Campus Main Library',
    status: 'available',
    createdAt: new Date().toISOString(),
  };

  await db.put('posts', post);
  return post;
}

/** Creates a public request for an item that is not currently listed. */
export async function createDemandRequest(data) {
  const db = await initDB();
  const request = {
    id: 'demand-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    requesterId: data.requesterId,
    title: data.title.trim(),
    description: data.description?.trim() || '',
    channel: data.channel,
    createdAt: new Date().toISOString(),
    status: 'open',
  };
  await db.put('demandRequests', request);
  return request;
}

/** Connects a newly-created listing to the request it fulfils. */
export async function fulfillDemandRequest(demandRequestId, postId, fulfillerId) {
  const db = await initDB();
  const demandRequest = await db.get('demandRequests', demandRequestId);
  if (!demandRequest || demandRequest.status !== 'open') {
    throw new Error('This request is no longer open.');
  }
  if (demandRequest.requesterId === fulfillerId) {
    throw new Error('You cannot fulfil your own request.');
  }
  demandRequest.status = 'fulfilled';
  demandRequest.fulfilledByPostId = postId;
  demandRequest.fulfilledAt = new Date().toISOString();
  await db.put('demandRequests', demandRequest);
  return demandRequest;
}

export async function getAllDemandRequests() {
  const db = await initDB();
  return db.getAll('demandRequests');
}

/**
 * Submits a borrow request for a post.
 * Precondition: post.status === 'available'
 * @param {string} postId
 * @param {string} borrowerId
 */
export async function submitRequest(postId, borrowerId) {
  const db = await initDB();
  const post = await db.get('posts', postId);

  if (!post || post.status !== 'available') {
    throw new Error('Item is not currently available for request.');
  }

  if (post.ownerId === borrowerId) {
    throw new Error('You cannot request your own post.');
  }

  const request = {
    id: 'req-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    postId,
    borrowerId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  await db.put('requests', request);
  return request;
}

/**
 * Accepts a borrow request.
 * Effects:
 * - Target request status -> 'accepted'
 * - Sibling pending requests on same post -> 'closed_auto'
 * - Post status -> 'lent'
 * - Creates an exchange row with state='payment_pending', securityDepositPaid=false, securityDepositRefunded=false
 * @param {string} requestId
 */
export async function acceptRequest(requestId) {
  const db = await initDB();
  const request = await db.get('requests', requestId);
  if (!request || request.status !== 'pending') {
    throw new Error('Request cannot be accepted.');
  }

  const post = await db.get('posts', request.postId);
  if (!post) {
    throw new Error('Associated post not found.');
  }

  // 1. Accept target request
  request.status = 'accepted';
  await db.put('requests', request);

  // 2. Auto-close sibling pending requests on same post
  const allRequests = await db.getAllFromIndex('requests', 'postId', request.postId);
  for (const sibling of allRequests) {
    if (sibling.id !== requestId && sibling.status === 'pending') {
      sibling.status = 'closed_auto';
      await db.put('requests', sibling);
    }
  }

  // 3. Mark post as lent
  post.status = 'lent';
  await db.put('posts', post);

  // 4. Create exchange record with state='payment_pending'
  const defaultPickup = post.location || 'Campus Main Library';
  const exchange = {
    id: 'exch-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    requestId: request.id,
    postId: post.id,
    ownerId: post.ownerId,
    borrowerId: request.borrowerId,
    state: 'payment_pending',
    securityDepositPaid: false,
    securityDepositRefunded: false,
    finalPaymentPaid: false,
    platformFee: 0,
    transactionAmount: 0,
    pickupLocation: defaultPickup,
    dropoffLocation: '', // Explicit empty requirement
    history: [
      {
        state: 'accepted',
        timestamp: new Date().toISOString(),
      },
      {
        state: 'payment_pending',
        timestamp: new Date().toISOString(),
      },
    ],
  };

  await db.put('exchanges', exchange);
  return exchange;
}

/**
 * Updates pickupLocation for an exchange (Owner only)
 */
export async function updatePickupLocation(exchangeId, ownerId, pickupLocation) {
  const db = await initDB();
  const exchange = await db.get('exchanges', exchangeId);
  if (!exchange || exchange.ownerId !== ownerId) {
    throw new Error('Unauthorized to update pickup location.');
  }

  exchange.pickupLocation = pickupLocation.trim();
  await db.put('exchanges', exchange);
  return exchange;
}

/**
 * Updates dropoffLocation for an exchange (Borrower only)
 */
export async function updateDropoffLocation(exchangeId, borrowerId, dropoffLocation) {
  const db = await initDB();
  const exchange = await db.get('exchanges', exchangeId);
  if (!exchange || exchange.borrowerId !== borrowerId) {
    throw new Error('Unauthorized to update dropoff location.');
  }

  exchange.dropoffLocation = dropoffLocation.trim();
  await db.put('exchanges', exchange);
  return exchange;
}

/**
 * Confirms security deposit payment: payment_pending -> handover
 * Precondition: exchange.state === 'payment_pending' AND dropoffLocation is set
 */
export async function confirmDepositPaid(exchangeId, dropoffLocation = '') {
  const db = await initDB();
  const exchange = await db.get('exchanges', exchangeId);
  if (!exchange || exchange.state !== 'payment_pending') {
    throw new Error('Cannot confirm deposit from current state.');
  }

  if (dropoffLocation && dropoffLocation.trim()) {
    exchange.dropoffLocation = dropoffLocation.trim();
  }

  if (!exchange.dropoffLocation || !exchange.dropoffLocation.trim()) {
    throw new Error('Dropoff location must be explicitly specified before paying security deposit.');
  }

  exchange.securityDepositPaid = true;
  exchange.state = 'handover';
  exchange.history.push({
    state: 'handover',
    note: 'Security deposit confirmed paid',
    timestamp: new Date().toISOString(),
  });

  await db.put('exchanges', exchange);
  return exchange;
}

/**
 * Marks handover completed.
 * Precondition: exchange.state === 'handover' and exchange.securityDepositPaid === true
 */
export async function markHandover(exchangeId) {
  const db = await initDB();
  const exchange = await db.get('exchanges', exchangeId);
  if (!exchange || exchange.state !== 'handover' || !exchange.securityDepositPaid) {
    throw new Error('Security deposit must be paid before handover can proceed.');
  }

  exchange.history.push({
    state: 'handover_confirmed',
    timestamp: new Date().toISOString(),
  });
  await db.put('exchanges', exchange);
  return exchange;
}

/**
 * Advances exchange state: handover -> returned
 * Precondition: exchange.state === 'handover'
 */
export async function markReturned(exchangeId) {
  const db = await initDB();
  const exchange = await db.get('exchanges', exchangeId);
  if (!exchange || exchange.state !== 'handover') {
    throw new Error('Cannot transition to returned from current state.');
  }

  exchange.state = 'returned';
  exchange.history.push({ state: 'returned', timestamp: new Date().toISOString() });
  await db.put('exchanges', exchange);
  return exchange;
}

/**
 * Advances exchange state: returned -> inspected
 * Trigger point for security deposit refund (if no open complaint exists on this exchange)
 * Precondition: exchange.state === 'returned'
 */
export async function markInspected(exchangeId) {
  const db = await initDB();
  const exchange = await db.get('exchanges', exchangeId);
  if (!exchange || exchange.state !== 'returned') {
    throw new Error('Cannot transition to inspected from current state.');
  }

  // Check if any open complaint exists on this exchange
  const complaints = await db.getAllFromIndex('complaints', 'exchangeId', exchangeId);
  const hasOpenComplaint = complaints && complaints.some((c) => c.status === 'open');

  if (!hasOpenComplaint) {
    exchange.securityDepositRefunded = true;
  } else {
    exchange.securityDepositRefunded = false; // withheld pending complaint resolution
  }

  exchange.state = 'inspected';
  exchange.history.push({
    state: 'inspected',
    securityDepositRefunded: exchange.securityDepositRefunded,
    timestamp: new Date().toISOString(),
  });
  await db.put('exchanges', exchange);
  return exchange;
}

/**
 * Confirms final payment (borrowing cost + platform fee): inspected -> settled
 * Precondition: exchange.state === 'inspected'
 */
export async function confirmFinalPayment(exchangeId) {
  const db = await initDB();
  const exchange = await db.get('exchanges', exchangeId);
  if (!exchange || exchange.state !== 'inspected') {
    throw new Error('Cannot settle payment before inspection.');
  }

  const post = await db.get('posts', exchange.postId);
  const borrowingCost = post?.borrowingCost || 0;
  const securityDeposit = post?.securityDeposit || 0;
  const platformFee = computePlatformFee(borrowingCost);
  const transactionAmount = borrowingCost + platformFee + securityDeposit;

  exchange.platformFee = platformFee;
  exchange.transactionAmount = transactionAmount;
  exchange.finalPaymentPaid = true;
  exchange.state = 'settled';
  exchange.history.push({
    state: 'settled',
    note: 'Final borrowing cost and platform fee paid',
    timestamp: new Date().toISOString(),
  });
  await db.put('exchanges', exchange);

  // Set post back to available
  if (post) {
    post.status = 'available';
    await db.put('posts', post);
  }

  return exchange;
}

/**
 * Backward compatibility alias for settling
 */
export async function markSettled(exchangeId) {
  return confirmFinalPayment(exchangeId);
}

/**
 * Submits a rating for a settled exchange. Trust is derived live from rated exchanges.
 * Precondition: exchange.state === 'settled'
 */
export async function submitRating(exchangeId, value) {
  const ratingVal = Number(value);
  const db = await initDB();
  const exchange = await db.get('exchanges', exchangeId);
  if (!exchange || exchange.state !== 'settled') {
    throw new Error('Can only rate a settled exchange.');
  }

  exchange.state = 'rated';
  exchange.rating = ratingVal;
  exchange.history.push({
    state: 'rated',
    rating: ratingVal,
    timestamp: new Date().toISOString(),
  });
  await db.put('exchanges', exchange);

  return { exchange };
}

/**
 * Raises a complaint against an exchange.
 * Precondition: exchange exists (any state)
 */
export async function raiseComplaint(exchangeId, userId, text) {
  const db = await initDB();
  const exchange = await db.get('exchanges', exchangeId);
  if (!exchange) {
    throw new Error('Exchange not found.');
  }

  const complaint = {
    id: 'comp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    exchangeId,
    raisedBy: userId,
    text: text.trim(),
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  await db.put('complaints', complaint);
  return complaint;
}

/**
 * Resolves an open complaint.
 * Precondition: complaint.status === 'open'
 */
export async function resolveComplaint(complaintId) {
  const db = await initDB();
  const complaint = await db.get('complaints', complaintId);
  if (!complaint || complaint.status !== 'open') {
    throw new Error('Complaint cannot be resolved.');
  }

  complaint.status = 'resolved';
  complaint.resolvedAt = new Date().toISOString();
  await db.put('complaints', complaint);

  // If the exchange was inspected with withheld deposit, release refund upon resolution
  if (complaint.exchangeId) {
    const exchange = await db.get('exchanges', complaint.exchangeId);
    if (exchange && (exchange.state === 'inspected' || exchange.state === 'settled' || exchange.state === 'rated')) {
      const allComplaints = await db.getAllFromIndex('complaints', 'exchangeId', exchange.id);
      const stillHasOpen = allComplaints.some((c) => c.status === 'open');
      if (!stillHasOpen) {
        exchange.securityDepositRefunded = true;
        await db.put('exchanges', exchange);
      }
    }
  }

  return complaint;
}

/**
 * Generic transition helper maintained for compatibility with Phase 1 stub signature
 */
export function transition(exchange, action) {
  return exchange;
}

// ----------------------------------------------------
// IndexedDB Query Helpers for Page Components
// ----------------------------------------------------

export async function getAllPosts() {
  const db = await initDB();
  return db.getAll('posts');
}

/** The public feed never includes a pending, lent, or closed listing. */
export async function getAvailablePosts() {
  const db = await initDB();
  return db.getAllFromIndex('posts', 'status', 'available');
}

export async function getPostById(id) {
  const db = await initDB();
  return db.get('posts', id);
}

export async function getAllUsers() {
  const db = await initDB();
  const [users, exchanges] = await Promise.all([db.getAll('users'), db.getAll('exchanges')]);
  return withLiveTrustScores(users, exchanges);
}

export async function getUserById(id) {
  const db = await initDB();
  const [user, exchanges] = await Promise.all([db.get('users', id), db.getAll('exchanges')]);
  return user ? withLiveTrustScores([user], exchanges)[0] : undefined;
}

/** Adds derived trust fields without persisting a mutable score on users. */
export function withLiveTrustScores(users, exchanges) {
  return users.map((user) => {
    const ratings = exchanges
      .filter((exchange) => exchange.ownerId === user.id && exchange.state === 'rated' && Number.isFinite(exchange.rating))
      .map((exchange) => exchange.rating);
    const trustScore = ratings.length
      ? Math.round((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) * 10) / 10
      : null;
    return { ...user, trustScore, ratingsCount: ratings.length };
  });
}

export async function getRequestsByBorrower(borrowerId) {
  const db = await initDB();
  return db.getAllFromIndex('requests', 'borrowerId', borrowerId);
}

export async function getRequestsByPost(postId) {
  const db = await initDB();
  return db.getAllFromIndex('requests', 'postId', postId);
}

export async function getAllRequests() {
  const db = await initDB();
  return db.getAll('requests');
}

export async function getPostsByOwner(ownerId) {
  const db = await initDB();
  return db.getAllFromIndex('posts', 'ownerId', ownerId);
}

export async function getExchangesByOwner(ownerId) {
  const db = await initDB();
  const all = await db.getAll('exchanges');
  return all.filter((e) => e.ownerId === ownerId);
}

export async function getExchangesByBorrower(borrowerId) {
  const db = await initDB();
  const all = await db.getAll('exchanges');
  return all.filter((e) => e.borrowerId === borrowerId);
}

export async function getAllExchanges() {
  const db = await initDB();
  return db.getAll('exchanges');
}

export async function getExchangeById(id) {
  const db = await initDB();
  return db.get('exchanges', id);
}

export async function getExchangeByRequestId(requestId) {
  const db = await initDB();
  return db.getFromIndex('exchanges', 'requestId', requestId);
}

export async function getAllComplaints() {
  const db = await initDB();
  return db.getAll('complaints');
}

export async function getUserStats(userId) {
  const db = await initDB();
  const allExchanges = await db.getAll('exchanges');
  const userExchanges = allExchanges.filter(
    (e) => (e.ownerId === userId || e.borrowerId === userId) && e.state === 'rated'
  );
  return {
    successfulExchangesCount: userExchanges.length,
  };
}

export async function getCampusImpactStats() {
  const db = await initDB();
  const [users, posts, exchanges] = await Promise.all([
    db.getAll('users'),
    db.getAll('posts'),
    db.getAll('exchanges'),
  ]);

  const activeMembersCount = users.length;
  const resourcesSharedCount = posts.length;
  const completedExchanges = exchanges.filter((e) => e.state === 'rated');
  const successfulExchangesCount = completedExchanges.length;

  const channelCounts = {};
  for (const p of posts) {
    if (p.channel) {
      channelCounts[p.channel] = (channelCounts[p.channel] || 0) + 1;
    }
  }
  let popularCategory = 'None yet';
  let maxCount = 0;
  for (const [channel, count] of Object.entries(channelCounts)) {
    if (count > maxCount) {
      maxCount = count;
      popularCategory = channel;
    }
  }

  let moneySaved = 0;
  for (const ex of completedExchanges) {
    const post = posts.find((p) => p.id === ex.postId);
    moneySaved += post?.borrowingCost || 50;
  }

  const postCompletedCount = {};
  for (const ex of completedExchanges) {
    postCompletedCount[ex.postId] = (postCompletedCount[ex.postId] || 0) + 1;
  }
  const resourcesReusedCount = Object.values(postCompletedCount).filter((c) => c > 1).length;

  const trustRatings = completedExchanges
    .map((exchange) => exchange.rating)
    .filter((rating) => Number.isFinite(rating));
  const avgTrustScore = trustRatings.length
    ? (Math.round((trustRatings.reduce((sum, rating) => sum + rating, 0) / trustRatings.length) * 10) / 10).toFixed(1)
    : 'N/A';

  return {
    activeMembersCount,
    resourcesSharedCount,
    successfulExchangesCount,
    popularCategory,
    popularCategoryCount: maxCount,
    moneySaved,
    resourcesReusedCount,
    avgTrustScore,
  };
}
