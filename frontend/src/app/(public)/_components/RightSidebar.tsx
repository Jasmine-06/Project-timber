import React from 'react'

// Static popular communities data
const popularCommunities = [
  { name: 'r/PlantLovers', members: '2.4M', icon: '🌿' },
  { name: 'r/Gardening', members: '1.3M', icon: '🌱' },
  { name: 'r/Nature', members: '3.6M', icon: '🌲' },
  { name: 'r/Forestry', members: '847K', icon: '🌳' },
  { name: 'r/EcoFriendly', members: '1.2M', icon: '♻️' },
]

export default function RightSidebar() {
  return (
    <div className="hidden xl:block w-[300px] shrink-0 sticky top-32 mt-8">
      <div>
        {/* Popular Communities */}
        <div>
          <h3 className="text-sm font-bold text-muted-foreground mb-4 tracking-wide">
            POPULAR COMMUNITIES
          </h3>
          <div className="space-y-1">
            {popularCommunities.map((community, index) => (
              <div
                key={index}
                className="flex items-center gap-3 py-3 px-2 rounded-md hover:bg-muted/20 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                  {community.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-medium text-foreground truncate group-hover:text-primary transition-colors">
                    {community.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {community.members} members
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button className="text-sm text-primary hover:text-primary/80 mt-3 px-2 font-medium">
            See more
          </button>
        </div>
      </div>
    </div>
  )
}
