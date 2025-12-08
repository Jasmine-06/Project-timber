import React from 'react'
import { PostCard } from './_components/PostCard'
import { RightSidebar } from './_components/RightSidebar'

export default function page() {
  return (
    <div className="flex gap-8 justify-center">
      {/* Main Feed */}
      <div className="flex flex-col w-full md:max-w-[640px]">
        <PostCard 
          postId="1"
          username="fashionista"
          userAvatar="https://i.pravatar.cc/150?img=47"
          timeAgo="15m"
          caption="Feeling confident in this look 💫 Sometimes the simplest outfits make the biggest statement. What's your go-to style? #OOTD #Fashion #Style"
          images={["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=750&fit=crop"]}
          likesCount={1523}
          commentsCount={42}
        />
        <PostCard 
          postId="2"
          username="urbanexplorer"
          userAvatar="https://i.pravatar.cc/150?img=33"
          timeAgo="2h"
          caption="City lights and late nights 🌃 There's something magical about the urban landscape after dark. Where's your favorite city to explore? #CityLife #UrbanPhotography #NightVibes"
          images={["https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&h=750&fit=crop"]}
          likesCount={2847}
          commentsCount={156}
          isLiked={true}
        />
        <PostCard 
          postId="3"
          username="fitnessmotivation"
          userAvatar="https://i.pravatar.cc/150?img=28"
          timeAgo="4h"
          caption="Progress over perfection 💪 Every workout counts, every rep matters. Keep pushing! #Fitness #Motivation #GymLife #HealthyLiving"
          images={["https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=750&fit=crop"]}
          likesCount={3421}
          commentsCount={89}
          isBookmarked={true}
        />
        <PostCard 
          postId="4"
          username="foodiedelight"
          userAvatar="https://i.pravatar.cc/150?img=52"
          timeAgo="6h"
          caption="Brunch goals achieved ☕🥐 Nothing beats a lazy Sunday morning with good food and great company. What's your favorite brunch spot? #Foodie #Brunch #FoodPhotography"
          images={["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=750&fit=crop"]}
          likesCount={892}
          commentsCount={34}
        />
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}
