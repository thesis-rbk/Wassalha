const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const prisma = require('../../prisma');

// Use the stealth plugin to avoid bot detection
puppeteer.use(StealthPlugin());

// Selectors for known websites
const SELECTORS = {
    'aliexpress.com': {
        name: '.product-title-text',
        price: '.product-price-value',
        description: '.product-description',
        image: '.gallery-image'
    },
};

// Generic fallback selectors
const GENERIC_SELECTORS = {
    name: ['h1', '[class*="title"]', '[id*="title"]'],
    price: ['[class*="price"]', '#price', '.price', 'span:contains("$")'],
    description: ['[class*="description"]', '[id*="description"]', '[class*="product-details"]'],
    image: ['img[class*="product"], img[class*="gallery"], img[src*="product"]']
};

// Function to scrape product data
const scrapeProduct = async (url) => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        // Set a fake user-agent to avoid bot detection
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );

        console.log('🌍 Navigating to:', url);
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

        // Determine selectors based on domain
        const domain = new URL(url).hostname.replace('www.', '');
        const selectors = SELECTORS[domain] || GENERIC_SELECTORS;

        // Function to extract text content
        const extractText = async (selectors) => {
            for (const selector of selectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 5000 });
                    return await page.$eval(selector, el => el.textContent.trim());
                } catch (err) {
                    console.log(`⚠️ Not found: ${selector}`);
                }
            }
            return 'Not found';
        };

        // Function to extract image URL
        const extractImage = async (selectors) => {
            for (const selector of selectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 5000 });
                    return await page.$eval(selector, el => el.src);
                } catch (err) {
                    console.log(`⚠️ Image not found: ${selector}`);
                }
            }
            return 'No image found';
        };

        // Extract product details
        const productData = {
            name: await extractText(selectors.name),
            price: await extractText(selectors.price),
            description: await extractText(selectors.description),
            imageUrl: await extractImage(selectors.image)
        };

        console.log('✅ Scraped Data:', productData);

        if (!productData.name || !productData.price) {
            throw new Error('Could not find product details');
        }

        return productData;

    } catch (error) {
        console.error('❌ Scraping error:', error);
        return { error: error.message };
    } finally {
        await browser.close();
    }
};

// API Controller for Scraping
const scrapeController = {
    scrapeProduct: async (req, res) => {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'URL is required'
                });
            }

            console.log('🔍 Scraping product from:', url);
            const scrapedData = await scrapeProduct(url);

            if (scrapedData.error) {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to scrape product',
                    error: scrapedData.error
                });
            }

            // Store product image in database
            const media = await prisma.media.create({
                data: {
                    url: scrapedData.imageUrl,
                    type: 'IMAGE',
                }
            });

            // Store product details in database
            const product = await prisma.goods.create({
                data: {
                    name: scrapedData.name,
                    price: parseFloat(scrapedData.price.replace(/[^0-9.]/g, '')) || 0, // Clean price
                    description: scrapedData.description,
                    goodsUrl: url,
                    imageId: media.id,
                    categoryId: 1, // Replace with correct category logic
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Product scraped successfully',
                product
            });

        } catch (error) {
            console.error('❌ Error in scrapeProduct:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to scrape product',
                error: error.message
            });
        }
    },

    // Validate URL before scraping
    validateUrl: async (req, res) => {
        try {
            const { url } = req.body;

            if (!url) {
                return res.status(400).json({
                    success: false,
                    message: 'URL is required'
                });
            }

            // Simple validation check
            const valid = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/.test(url);

            if (!valid) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid URL format'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Valid URL',
                url
            });

        } catch (error) {
            console.error('❌ Error in validateUrl:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to validate URL',
                error: error.message
            });
        }
    }
};

module.exports = scrapeController;
