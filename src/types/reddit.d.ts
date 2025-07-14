export interface RedditPostData {
    url: string;
    link_flair_text: string;
    title: string;
    permalink: string;
}

export interface RedditChild {
    data: RedditPostData;
}

export interface RedditResponse {
    data: {
        children: RedditChild[];
    };
}

export interface MemeData {
    image: string;
    category: string;
    caption: string;
    permalink: string;
}