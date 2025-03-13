const prisma = require('../../prisma/index');
const { authenticateUser } = require('../middleware/middleware');

class RequestController {
    // Create Request
    async createRequest(req, res) {
        console.log('📥 Received request creation request');
        console.log('👤 User ID:', req.user.id);
        console.log('📦 Request body:', req.body);
        
        try {
            // Get user ID from authenticated user
            const userId = req.user.id;
            
            const request = await prisma.request.create({
                data: {
                    userId, // Now using authenticated user's ID
                    goodsId: req.body.goodsId,
                    quantity: req.body.quantity,
                    goodsLocation: req.body.goodsLocation,
                    goodsDestination: req.body.goodsDestination,
                    date: new Date(req.body.date),
                    withBox: req.body.withBox || false,
                    status: 'PENDING'
                },
                include: {
                    user: true,
                    goods: true,
                },
            });
            console.log('✅ Request created successfully:', request.id);

            res.status(201).json({
                success: true,
                data: request,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    // Get All Requests with complete information
    async getAllRequests(req, res) {
        try {
            const requests = await prisma.request.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile: {
                                select: {
                                    image: true,
                                    isVerified: true
                                }
                            },
                            reputation: {
                                select: {
                                    score: true,
                                    totalRatings: true,
                                    level: true
                                }
                            }
                        }
                    },
                    goods: {
                        include: {
                            image: true,  // This matches the Media relation in schema
                            category: true
                        }
                    },
                    pickup: true,
                    order: {
                        select: {
                            id: true,
                            orderStatus: true
                        }
                    }
                },
                orderBy: {
                    date: 'desc'
                },
                where: {
                    status: {
                        in: ['PENDING', 'ACCEPTED']
                    }
                }
            });

            console.log('Backend sending user data:', requests.map(r => ({
                requestId: r.id,
                userName: r.user?.name,
                userId: r.user?.id,
                userRating: r.user?.reputation?.score
            })));

            // Transform to include full image URLs
            const transformedRequests = requests.map(request => ({
                ...request,
                goods: {
                    ...request.goods,
                    goodsUrl: request.goods.image ? `/api/uploads/${request.goods.image.filename}` : null
                }
            }));

            console.log('First request debug:', {
                goodsId: transformedRequests[0]?.goods?.id,
                imageData: transformedRequests[0]?.goods?.image,
                goodsUrl: transformedRequests[0]?.goods?.goodsUrl,
                filename: transformedRequests[0]?.goods?.image?.filename
            });

            res.status(200).json({
                success: true,
                data: transformedRequests
            });
        } catch (error) {
            console.error('Error in getAllRequests:', error);
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get Request by ID with complete information
    async getRequestById(req, res) {
        try {
            const requestId = parseInt(req.params.id);
            console.log('🔍 Getting request details for ID:', requestId);

            if (!requestId) {
                return res.status(400).json({
                    success: false,
                    message: 'Request ID is required'
                });
            }

            const request = await prisma.request.findUnique({
                where: {
                    id: requestId  // This was missing the actual ID value
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile: {
                                select: {
                                    image: true,
                                    isVerified: true
                                }
                            }
                        }
                    },
                    goods: {
                        include: {
                            image: {
                                select: {
                                    id: true,
                                    url: true,
                                    filename: true
                                }
                            },
                            category: true
                        }
                    },
                    pickup: true,
                    order: true
                }
            });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    message: 'Request not found'
                });
            }

            // Transform image URLs
            const transformedRequest = {
                ...request,
                goods: {
                    ...request.goods,
                    image: request.goods.image ? {
                        ...request.goods.image,
                        url: `/api/uploads/${request.goods.image.filename}`
                    } : null
                }
            };

            return res.status(200).json({
                success: true,
                data: transformedRequest
            });
        } catch (error) {
            console.error('Error in getRequestById:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch request details',
                error: error.message
            });
        }
    }

    // Update Request
    async updateRequest(req, res) {
        try {
            // Check if user owns the request
            const request = await prisma.request.findUnique({
                where: { id: parseInt(req.params.id) }
            });

            if (!request || request.userId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to update this request'
                });
            }

            const updatedRequest = await prisma.request.update({
                where: { id: parseInt(req.params.id) },
                data: {
                    quantity: req.body.quantity,
                    goodsLocation: req.body.goodsLocation,
                    goodsDestination: req.body.goodsDestination,
                    date: req.body.date ? new Date(req.body.date) : undefined,
                    withBox: req.body.withBox,
                    status: req.body.status,
                },
                include: {
                    user: true,
                    goods: true,
                },
            });

            res.status(200).json({
                success: true,
                data: updatedRequest,
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    // Delete Request
    async deleteRequest(req, res) {
        try {
            const requestId = parseInt(req.params.id);
            if (!requestId) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid request ID'
                });
            }

            await prisma.request.delete({
                where: { id: requestId },
            });

            res.status(200).json({
                success: true,
                message: 'Request deleted successfully',
            });
        } catch (error) {
            console.error('Error in deleteRequest:', error);
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    // Get User's Requests
    async getUserRequests(req, res) {
        try {
            // Get user ID from authenticated user
            const userId = req.user?.id;
            console.log('👤 Getting requests for authenticated user:', userId);

            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'Not authenticated'
                });
            }

            // Find all requests for this user
            const requests = await prisma.request.findMany({
                where: {
                    OR: [
                        { userId: userId },          // Requests created by the user
                        { 'order.spId': userId }     // Requests where user is service provider
                    ]
                },
                include: {
                    goods: {
                        include: {
                            image: true,
                            category: true
                        }
                    },
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile: {
                                select: {
                                    image: true,
                                    isVerified: true
                                }
                            }
                        }
                    },
                    order: true
                }
            });

            console.log(`📦 Found ${requests.length} requests for user ${userId}`);

            return res.status(200).json({
                success: true,
                data: requests,
                count: requests.length
            });
        } catch (error) {
            console.error('❌ Error in getUserRequests:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch user requests',
                error: error.message
            });
        }
    }

    // Update Request Status
    async updateRequestStatus(req, res) {
        try {
            const { status } = req.body;
            const requestId = parseInt(req.params.id);

            // Validate status transition
            const currentRequest = await prisma.request.findUnique({
                where: { id: requestId }
            });

            if (currentRequest.status === 'ACCEPTED' && status !== 'CANCELLED') {
                return res.status(400).json({
                    success: false,
                    error: 'Cannot change status of accepted request'
                });
            }

            const updatedRequest = await prisma.request.update({
                where: { id: requestId },
                data: { status },
                include: {
                    user: true,
                    goods: true
                }
            });

            res.status(200).json({
                success: true,
                data: updatedRequest
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get Offers for a Request
    async getRequestOffers(req, res) {
        try {
            const requestId = parseInt(req.params.id);
            console.log('🔍 Getting offers for request:', requestId);
            
            // Since there's no direct Offer model in your schema,
            // we'll query for orders that are in PENDING state
            // which effectively represent offers
            const offers = await prisma.order.findMany({
                where: {
                    requestId: requestId,
                    orderStatus: 'PENDING'
                },
                include: {
                    traveler: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profile: {
                                select: {
                                    imageId: true,
                                    isVerified: true
                                }
                            },
                            reputation: {
                                select: {
                                    score: true,
                                    totalRatings: true,
                                    level: true
                                }
                            }
                        }
                    }
                }
            });

            console.log(`📦 Found ${offers.length} offers for request ${requestId}`);

            res.status(200).json({
                success: true,
                data: offers
            });
        } catch (error) {
            console.error('Error in getRequestOffers:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = new RequestController(); 