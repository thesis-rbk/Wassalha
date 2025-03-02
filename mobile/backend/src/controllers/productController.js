const fs = require("fs");
const path = require("path");
const Fuse = require('fuse.js');
const axios = require('axios');
const cheerio = require('cheerio');

const illegalItemsPath = path.join(__dirname, "../../illegalItems.json");
console.log(illegalItemsPath);
async function checkIllegalItems(req, res) {
    const { name, description, url } = req.body;

    // Load illegal items from JSON file
    fs.readFile(illegalItemsPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ message: "Error reading illegal items." });
        }

        const illegalItems = JSON.parse(data).illegal_items;

        // Create a flat array of all illegal products
        const products = illegalItems.flatMap(item => item.products || []);

        // Set up Fuse.js options
        const options = {
            includeScore: true,
            threshold: 0.3,
            keys: []
        };

        const fuse = new Fuse(products, options);

        // Check for illegal items
        const nameMatches = fuse.search(name);
        const descriptionMatches = fuse.search(description);
        const urlMatches = fuse.search(url);

        console.log("Name Matches:", nameMatches);
        console.log("Description Matches:", descriptionMatches);
        console.log("URL Matches:", urlMatches);

        const isIllegal = nameMatches.length > 0 || descriptionMatches.length > 0 || urlMatches.length > 0;

        if (isIllegal) {
            return res.status(400).json({ message: "The item is illegal." });
        }

        // Fetch product details from the provided URL
        axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
                'Referer': 'https://www.example.com' // Replace with a valid referer
            }
        })
            .then(response => {
                console.log(response.data); // Log the entire HTML response
                const $ = cheerio.load(response.data);
                let title = $('title').text(); // Extract title
                let description = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content'); // Extract description

                // Handle empty title
                if (!title || title.trim() === "") {
                    title = "No title found"; // Default title if none is found
                }

                // Return the product details
                return res.status(200).json({ title, description });
            })
            .catch(err => {
                return res.status(500).json({ message: "Error fetching product details.", error: err.message });
            });
    });
}

module.exports = {
    checkIllegalItems,
    // ... other exports
}; 