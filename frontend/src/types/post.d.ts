interface IPost {
    _id: string;
    user_id: string | IUser; // Can be populated
    images: string[];
    videos: string[];
    caption: string;
    createdAt: string;
    updatedAt: string;
    likes?: string[]; // Assuming populated or added
    bookmarks?: string[];
    comments?: string[];
    // New fields from backend for authenticated users
    isLiked?: boolean;
    isBookmarked?: boolean;
    userComment?: IComment | null;
}

interface IComment {
    _id: string;
    post_id: string;
    user_id: string | IUser; // Can be populated
    parent_id?: string | null;
    content: string;
    createdAt: string;
    updatedAt: string;
}
