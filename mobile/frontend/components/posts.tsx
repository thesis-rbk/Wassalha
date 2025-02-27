import axios from 'axios';
import { useEffect, useState } from 'react';
import * as dotenv from 'dotenv';
export function Posts() {
    const url = process.env.API_URL as string;
    const [posts, setPosts] = useState([]);
    const fetchPosts = async () => {
        try {
            console.log("url", url)
            const result = await axios.get("http://localhost:5000/api/");
            console.log("result from posts", result.data)
        } catch (err) {
            console.log("error from posts", err)
        }
    }
    useEffect(() => {
        fetchPosts();
    }, []);
    return <view>Posts</view>
}
