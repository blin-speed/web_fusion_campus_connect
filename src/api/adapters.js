// Converts backend User entity to UI User model
export function adaptUser(user) {
  if (!user) return null;
  return {
    ...user,
    year: user.studyYear, // Rename for UI
    isVerified: !!(user.isVerified || user.verified),
    trust: {
      score: user.trustScore != null ? user.trustScore : null,
      badge: user.trustScore >= 4.5 ? 'Trusted' : user.trustScore >= 3.0 ? 'Reliable' : 'New',
      ratingAvg: user.trustScore || 0,
      ratingsCount: user.ratingsCount || 0,
      successfulExchanges: user.successfulExchanges || 0,
      lateReturns: user.lateReturns || 0,
      disputes: user.disputes || 0,
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
