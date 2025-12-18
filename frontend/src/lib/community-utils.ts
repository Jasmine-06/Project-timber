/**
 * Utility functions for community operations
 */

/**
 * Calculate the total number of unique members in a community
 * Avoids double-counting users who are both admins and members
 */
export const getTotalMemberCount = (community: ICommunity | null): number => {
  if (!community) return 0;
  
  const admins = community.admins || [];
  const members = community.members || [];
  
  // Create a Set of all unique user IDs
  const allMemberIds = new Set([
    ...admins.map(admin => admin._id),
    ...members.map(member => member._id)
  ]);
  
  return allMemberIds.size;
};

/**
 * Get all unique members (admins + regular members) without duplicates
 */
export const getAllUniqueMembers = (community: ICommunity | null) => {
  if (!community) return [];
  
  const admins = community.admins || [];
  const members = community.members || [];
  
  // Create a Map to store unique members by ID
  const uniqueMembers = new Map();
  
  // Add all admins first
  admins.forEach(admin => {
    uniqueMembers.set(admin._id, { ...admin, isAdmin: true });
  });
  
  // Add members, but don't overwrite admins
  members.forEach(member => {
    if (!uniqueMembers.has(member._id)) {
      uniqueMembers.set(member._id, { ...member, isAdmin: false });
    }
  });
  
  return Array.from(uniqueMembers.values());
};

/**
 * Get regular members (excluding admins) to avoid showing duplicates in UI
 */
export const getRegularMembers = (community: ICommunity | null) => {
  if (!community) return [];
  
  const admins = community.admins || [];
  const members = community.members || [];
  
  return members.filter(
    (member) => !admins.some((admin) => admin._id === member._id)
  );
};