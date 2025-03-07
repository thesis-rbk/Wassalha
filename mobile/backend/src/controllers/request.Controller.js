const prisma = require('../../prisma');
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
            throw error;
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
            console.log("hellooooooooooooooooooooooooo", hello);
            const request = await prisma.request.findUnique({
                where: { 
                    id: parseInt(req.params.id) 
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
                    error: 'Request not found'
                });
            }

            // Transform the response to include full image URL
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

            res.status(200).json({
                success: true,
                data: transformedRequest
            });
        } catch (error) {
            console.error('Error in getRequestById:', error);
            res.status(400).json({
                success: false,
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
            // Check if user owns the request
            const request = await prisma.request.findUnique({
                where: { id: parseInt(req.params.id) }
            });

            if (!request || request.userId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'Not authorized to delete this request'
                });
            }

            await prisma.request.delete({
                where: { id: parseInt(req.params.id) },
            });

            res.status(200).json({
                success: true,
                message: 'Request deleted successfully',
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    // Get User's Requests
    async getUserRequests(req, res) {
        try {
            const requests = await prisma.request.findMany({
                where: { userId: parseInt(req.user.id) },
                include: {
                    goods: {
                        include: {
                            image: {
                                select: {
                                    id: true,
                                    url: true,
                                    filename: true
                                }
                            }
                        }
                    },
                    pickup: true,
                    order: true,
                },
                orderBy: { date: 'desc' },
            });

            // Transform the responses to include full image URLs
            const transformedRequests = requests.map(request => ({
                ...request,
                goods: {
                    ...request.goods,
                    image: request.goods.image ? {
                        ...request.goods.image,
                        url: `/api/uploads/${request.goods.image.filename}`
                    } : null
                }
            }));

            res.status(200).json({
                success: true,
                data: transformedRequests,
            });
        } catch (error) {
            console.error('Error in getUserRequests:', error);
            res.status(400).json({
                success: false,
                error: error.message,
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
}

module.exports = new RequestController(); 