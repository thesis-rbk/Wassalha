const prisma = require("../../prisma/index");

// Fetch all service providers with required fields
exports.getAllServiceProviders = async (req, res) => {
  try {
    const serviceProviders = await prisma.serviceProvider.findMany({
      include: {
        user: {
          include: {
            profile: {
              include: {
                image: true
              }
            }
          }
        }
      }
    });
    res.status(200).json({
      success: true,
      data: serviceProviders,
    });
  } catch (error) {
    console.error("Error fetching service providers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service providers",
      error: error.message,
    });
  }
};

// Update the getServiceProviderByUserId function
exports.getServiceProviderByUserId = async (req, res) => {
  const { userId } = req.params;
  
  try {
    const serviceProvider = await prisma.serviceProvider.findFirst({
      where: {
        userId: parseInt(userId)
      },
      include: {
        user: {
          include: {
            profile: {
              include: {
                image: true
              }
            },
            reviewsReceived: {
              include: {
                reviewer: {
                  include: {
                    profile: {
                      include: {
                        image: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!serviceProvider) {
      return res.status(404).json({
        success: false,
        message: "Service provider not found"
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...serviceProvider,
        user: {
          ...serviceProvider.user,
          profile: {
            ...serviceProvider.user.profile,
            bio: serviceProvider.user.profile?.bio || null,
            review: serviceProvider.user.profile?.review || null,
            isBanned: serviceProvider.user.profile?.isBanned || false,
            verified: serviceProvider.user.profile?.verified || false,
          }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching service provider:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch service provider",
      error: error.message
    });
  }
}; 