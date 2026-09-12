import { getCollection } from 'astro:content';

export function getPublishedPosts() {
    return getCollection('blog', ({ data }) => data.draft !== true);
}
