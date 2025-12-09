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
