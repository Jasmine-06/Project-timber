"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

// Static mock data matching Reddit's top communities
const staticCommunities = [
  { id: 1, name: "r/funny", description: "Reddit's largest humor depository", members: "67M", icon: "😄" },
  { id: 2, name: "r/AskReddit", description: "r/AskReddit is the place to ask...", members: "57M", icon: "❓" },
  { id: 3, name: "r/gaming", description: "The Number One Gaming forum...", members: "47M", icon: "🎮" },
  { id: 4, name: "r/worldnews", description: "A place for major news from ar...", members: "47M", icon: "🌍" },
  { id: 5, name: "r/todayilearned", description: "You learn something new every...", members: "41M", icon: "💡" },
  { id: 6, name: "r/Music", description: "Reddit's Music Community", members: "35M", icon: "🎵" },
  { id: 7, name: "r/aww", description: "Things that make you go AWW...", members: "38M", icon: "🐱" },
  { id: 8, name: "r/movies", description: "r/movies is the world's largest...", members: "37M", icon: "🎬" },
  { id: 9, name: "r/memes", description: "Memed a way of describing cu...", members: "36M", icon: "😂" },
  { id: 10, name: "r/science", description: "This community is a place to sh...", members: "34M", icon: "🔬" },
  { id: 11, name: "r/Showerthoughts", description: "A subreddit for sharing those...", members: "34M", icon: "🚿" },
  { id: 12, name: "r/pics", description: "A place for photographs, pictur...", members: "33M", icon: "📷" },
  { id: 13, name: "r/news", description: "The place for news articles abo...", members: "31M", icon: "📰" },
  { id: 14, name: "r/Jokes", description: "The funniest sub on Reddit. Hu...", members: "30M", icon: "🤣" },
  { id: 15, name: "r/space", description: "Share & discuss informative co...", members: "28M", icon: "🚀" },
  { id: 16, name: "r/DIY", description: "DIY", members: "27M", icon: "🔨" },
  { id: 17, name: "r/books", description: "This is a moderated subreddit. I...", members: "27M", icon: "📚" },
  { id: 18, name: "r/videos", description: "Reddit's main subreddit for vid...", members: "27M", icon: "📹" },
  { id: 19, name: "r/askscience", description: "Ask a science question, get a...", members: "26M", icon: "🧪" },
  { id: 20, name: "r/nottheonion", description: "For true stories that could...", members: "26M", icon: "🧅" },
  { id: 21, name: "r/mildlyinteresting", description: "Aww, cripes. I didn't think I'd h...", members: "25M", icon: "🤔" },
  { id: 22, name: "r/food", description: "The internet's number one plac...", members: "24M", icon: "🍔" },
  { id: 23, name: "r/GetMotivated", description: "Welcome to /r/GetMotivated! ...", members: "24M", icon: "💪" },
  { id: 24, name: "r/EarthPorn", description: "The internet's largest communit...", members: "24M", icon: "🏔️" },
  { id: 25, name: "r/explainlikeimfive", description: "Explain Like I'm Five is the best...", members: "23M", icon: "👶" },
  { id: 26, name: "r/LifeProTips", description: "Tips that improve your life in o...", members: "23M", icon: "💡" },
  { id: 27, name: "r/gadgets", description: "Gadgets", members: "23M", icon: "📱" },
  { id: 28, name: "r/IAmA", description: "I Am A, where the mundane be...", members: "22M", icon: "🎤" },
  { id: 29, name: "r/Art", description: "Welcome to /r/Art, a subreddit f...", members: "22M", icon: "🎨" },
  { id: 30, name: "r/sports", description: "Sports News and Highlights fro...", members: "22M", icon: "⚽" },
  { id: 31, name: "r/dataisbeautiful", description: "DataIsBeautiful is for visualizat...", members: "22M", icon: "📊" },
  { id: 32, name: "r/Futurology", description: "A subreddit devoted to the fiel...", members: "21M", icon: "🔮" },
];

export default function CommunitiesPage() {
  const router = useRouter();

  const handleCommunityClick = (communityId: number) => {
    router.push(`/communities/r/${communityId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b border-border px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-xl font-semibold text-foreground mb-1">Top Communities</h1>
          <p className="text-sm text-muted-foreground">Timber's largest communities</p>
        </div>
      </div>

      {/* Communities List */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
          {staticCommunities.map((community, index) => (
            <div
              key={community.id}
              className="flex items-start gap-2 p-2 -mx-2 rounded-md"
            >
              {/* Rank Number */}
              <div className="text-sm font-medium text-muted-foreground min-w-[24px] pt-1">
                {index + 1}
              </div>

              {/* Avatar */}
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarFallback className="bg-muted text-foreground text-lg border border-border">
                  {community.icon}
                </AvatarFallback>
              </Avatar>

              {/* Community Info */}
              <div className="flex-1 min-w-0">
                <h3 
                  onClick={() => handleCommunityClick(community.id)}
                  className="font-medium text-sm text-foreground truncate hover:underline cursor-pointer w-fit"
                >
                  {community.name}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {community.description}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">
                  {community.members} members
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
