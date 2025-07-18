/**
 * Represents the data of a Reddit post.
 */
export interface RedditPostData {
    /**
     * The URL of the Reddit post.
     */
    url: string;
    /**
     * The flair text of the link.
     */
    link_flair_text: string;
    /**
     * The title of the Reddit post.
     */
    title: string;
    /**
     * The permalink to the Reddit post.
     */
    permalink: string;
}

/**
 * Represents a child object within a Reddit response, containing post data.
 */
export interface RedditChild {
    /**
     * The data of the Reddit post.
     */
    data: RedditPostData;
}

/**
 * Represents the overall structure of a Reddit API response.
 */
export interface RedditResponse {
    data: {
        /**
         * An array of Reddit child objects.
         */
        children: RedditChild[];
    };
}

/**
 * Represents structured data for a meme.
 */
export interface MemeData {
    /**
     * The URL of the meme image.
     */
    image: string;
    /**
     * The category of the meme.
     */
    category: string;
    /**
     * The caption of the meme.
     */
    caption: string;
    /**
     * The permalink to the meme source.
     */
    permalink: string;
}