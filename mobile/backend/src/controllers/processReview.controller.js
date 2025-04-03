const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// User-to-user review: traveler rates requester or vice versa
exports.createUserReview = async (req, res) => {
  const { reviewerId, reviewedId, orderId, rating, reviewType, comment } = req.body;

  if (!reviewerId || !reviewedId || !orderId || !rating || !reviewType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const review = await prisma.review.create({
      data: {
        reviewerId: parseInt(reviewerId),
        reviewedId: parseInt(reviewedId),
        orderId: parseInt(orderId),
        rating: parseInt(rating),
        reviewType,
        comment: comment || null,
        status: "PENDING", // or "APPROVED"
      },
    });

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error("❌ User review error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Experience review: how was the platform itself
exports.createExperienceReview = async (req, res) => {
  const { reviewerId, orderId, rating } = req.body;

  if (!reviewerId || !orderId || !rating) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const review = await prisma.experienceReview.create({
      data: {
        reviewerId: parseInt(reviewerId),
        orderId: parseInt(orderId),
        rating: parseInt(rating),
      },
    });

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error("❌ Experience review error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
