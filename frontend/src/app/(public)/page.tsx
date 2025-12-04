import React from 'react'
import { PostCard } from './_components/PostCard'
import { CreatePostBar } from './_components/CreatePostBar'
import { RightSidebar } from './_components/RightSidebar'

export default function page() {
  return (
    <div className="flex gap-8 justify-center">
      {/* Main Feed */}
      <div className="flex flex-col gap-4 w-full md:max-w-[640px]">
        <CreatePostBar />
        <PostCard 
          subreddit="r/indiameme"
          subredditIcon="https://styles.redditmedia.com/t5_2s3t7/styles/communityIcon_5d3t7.png"
          author="indiameme_bot"
          timeAgo="2 hr. ago"
          title="Genuine question. Why is Rupee reaching 90 against USD a big deal for everyone freaking out?"
          image="https://preview.redd.it/genuine-question-why-is-rupee-reaching-90-against-usd-a-v0-z8z8z8z8z8z8.png?auto=webp&s=12345678"
          votes={0}
          comments={15}
        />
         <PostCard 
          subreddit="r/AnimeMirchi"
          subredditIcon="https://styles.redditmedia.com/t5_2s3t7/styles/communityIcon_5d3t7.png"
          author="anime_fan_123"
          timeAgo="3 days ago"
          title="Your birth month decides which anime girl is fated to be your soulmate 💕"
          content="I got Rem! Who did you get?"
          votes={1240}
          comments={89}
        />
        <PostCard 
          subreddit="r/programming"
          subredditIcon="https://styles.redditmedia.com/t5_2s3t7/styles/communityIcon_5d3t7.png"
          author="dev_guru"
          timeAgo="5 hr. ago"
          title="The state of Web Development in 2025"
          content="It seems like AI is taking over everything. What are your thoughts on the future of frontend engineering?"
          votes={450}
          comments={230}
        />
      </div>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  )
}
