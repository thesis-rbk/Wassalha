const prisma = require('../../prisma');
const { authenticateUser } = require('../middleware/middleware');

class RequestController {
    // Create Request
    async createRequest(req, res) {
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
                            }
                        }
                    },
                    goods: {
                        include: {
                            image: true,
                            category: true
                        }
                    },
                    pickup: true,
                    order: {
                        select: {
                            id: true,
                            status: true
                        }
                    }
                },
                orderBy: {
                    date: 'desc'
                },
                where: {
                    status: {
                        in: ['PENDING', 'ACCEPTED'] // Only show active requests
                    }
                }
            });

            res.status(200).json({
                success: true,
                data: requests
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }

    // Get Request by ID with complete information
    async getRequestById(req, res) {
        try {
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
                            image: true,
                            category: true
                        }
                    },
                    pickup: true,
                    order: {
                        select: {
                            id: true,
                            orderStatus: true,
                            traveler: {
                                select: {
                                    id: true,
                                    name: true,
                                    profile: {
                                        select: {
                                            image: true,
                                            isVerified: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    error: 'Request not found'
                });
            }

            res.status(200).json({
                success: true,
                data: request
            });
        } catch (error) {
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
                where: { userId: parseInt(req.params.userId) },
                include: {
                    goods: true,
                    pickup: true,
                    order: true,
                },
                orderBy: { date: 'desc' },
            });

            res.status(200).json({
                success: true,
                data: requests,
            });
        } catch (error) {
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