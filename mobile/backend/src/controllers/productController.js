const fs = require("fs");
const path = require("path");
const Fuse = require("fuse.js");
const axios = require("axios");
const cheerio = require("cheerio");
const prisma = require("../../prisma");

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
    const products = illegalItems.flatMap((item) => item.products || []);

    // Set up Fuse.js options
    const options = {
      includeScore: true,
      threshold: 0.3,
      keys: [],
    };

    const fuse = new Fuse(products, options);

    // Check for illegal items
    const nameMatches = fuse.search(name);
    const descriptionMatches = fuse.search(description);
    const urlMatches = fuse.search(url);

    console.log("Name Matches:", nameMatches);
    console.log("Description Matches:", descriptionMatches);
    console.log("URL Matches:", urlMatches);

    const isIllegal =
      nameMatches.length > 0 ||
      descriptionMatches.length > 0 ||
      urlMatches.length > 0;

    if (isIllegal) {
      return res.status(400).json({ message: "The item is illegal." });
    }

    // Fetch product details from the provided URL
    axios
      .get(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
          Referer: "https://www.example.com", // Replace with a valid referer
        },
      })
      .then((response) => {
        console.log(response.data); // Log the entire HTML response
        const $ = cheerio.load(response.data);
        let title = $("title").text(); // Extract title
        let description =
          $('meta[name="description"]').attr("content") ||
          $('meta[property="og:description"]').attr("content"); // Extract description

        // Handle empty title
        if (!title || title.trim() === "") {
          title = "No title found"; // Default title if none is found
        }

        // Return the product details
        return res.status(200).json({ title, description });
      })
      .catch((err) => {
        return res.status(500).json({
          message: "Error fetching product details.",
          error: err.message,
        });
      });
  });
}

const verifyProduct = async (req, res) => {
  try {
    const { orderId } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Create media entry
    const mediaData = {
      url: req.file.path,
      type: "IMAGE",
      filename: req.file.filename,
      extension: "JPG",
      size: req.file.size,
      width: 100,
      height: 100,
    };

    const media = await prisma.media.create({
      data: mediaData,
    });

    // Update order with verification image
    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        verificationImageId: media.id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Verification photo uploaded successfully",
      imageUrl: mediaData.url,
    });
  } catch (error) {
    console.error("Error uploading verification photo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload verification photo",
      error: error.message,
    });
  }
};

const confirmProduct = async (req, res) => {
  const { orderId } = req.body;

  try {
    const updatedOrder = await prisma.goodsProcess.update({
      where: { orderId: parseInt(orderId) },
      data: {
        status: "CONFIRMED",
      },
    });

    res.status(200).json({
      success: true,
      message: "Product verified successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error confirming product:", error);
    res.status(500).json({
      success: false,
      message: "Failed to confirm product",
      error: error.message,
    });
  }
};

const requestNewPhoto = async (req, res) => {
  const { orderId } = req.body;

  try {
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        verificationImageId: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "New photo requested successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error requesting new photo:", error);
    res.status(500).json({
      success: false,
      message: "Failed to request new photo",
      error: error.message,
    });
  }
};

module.exports = {
  checkIllegalItems,
  verifyProduct,
  confirmProduct,
  requestNewPhoto,
};
