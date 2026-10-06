// Converts backend User entity to UI User model
export function adaptUser(user) {
  if (!user) return null;
  return {
    ...user,
    year: user.studyYear, // Rename for UI
    trust: {
      score: user.trustScore || null,
      badge: user.trustScore >= 80 ? 'Trusted' : user.trustScore >= 50 ? 'Reliable' : 'Caution',
      ratingAvg: 0,
      ratingsCount: 0,
      successfulExchanges: 0,
      lateReturns: 0,
      disputes: 0,
      disputesLost: 0,
    }
  };
}

export function adaptListing(post) {
  if (!post) return null;
  return {
    ...post,
    condition: post.itemCondition,
    accessories: typeof post.accessories === 'string' ? JSON.parse(post.accessories || '[]').catch(() => []) : (post.accessories || []),
    photos: post.photos || []
  };
}
