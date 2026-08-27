import { openDB } from 'idb';

export const DB_NAME = 'campus_circular_db';
export const DB_VERSION = 1;

/**
 * IndexedDB Schema Definition for Campus Circular
 *
 * Stores & Indexes:
 * - users: keyPath: id | fields: id, name, trustScore, ratingsCount
 * - posts: keyPath: id | fields: id, ownerId, title, channel, itemName, description, borrowingCost, securityDeposit, location, status, createdAt
 *   Indexes: ownerId, status, channel
 * - requests: keyPath: id | fields: id, postId, borrowerId, status, createdAt
 *   Indexes: postId, borrowerId
 * - exchanges: keyPath: id | fields: id, requestId, postId, ownerId, borrowerId, state, securityDepositPaid, finalPaymentPaid, platformFee, transactionAmount, pickupLocation, dropoffLocation, history
 *   Indexes: requestId
 * - complaints: keyPath: id | fields: id, exchangeId, raisedBy, text, status, createdAt
 *   Indexes: exchangeId, status
 */
export async function initDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 1. users
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'id' });
      }

      // 2. posts
      if (!db.objectStoreNames.contains('posts')) {
        const postsStore = db.createObjectStore('posts', { keyPath: 'id' });
        postsStore.createIndex('ownerId', 'ownerId', { unique: false });
        postsStore.createIndex('status', 'status', { unique: false });
        postsStore.createIndex('channel', 'channel', { unique: false });
      }

      // 3. requests
      if (!db.objectStoreNames.contains('requests')) {
        const requestsStore = db.createObjectStore('requests', { keyPath: 'id' });
        requestsStore.createIndex('postId', 'postId', { unique: false });
        requestsStore.createIndex('borrowerId', 'borrowerId', { unique: false });
      }

      // 4. exchanges
      if (!db.objectStoreNames.contains('exchanges')) {
        const exchangesStore = db.createObjectStore('exchanges', { keyPath: 'id' });
        exchangesStore.createIndex('requestId', 'requestId', { unique: false });
      }

      // 5. complaints
      if (!db.objectStoreNames.contains('complaints')) {
        const complaintsStore = db.createObjectStore('complaints', { keyPath: 'id' });
        complaintsStore.createIndex('exchangeId', 'exchangeId', { unique: false });
        complaintsStore.createIndex('status', 'status', { unique: false });
      }
    },
  });
}
