const prisma = require('../../prisma');

class RequestController {
    // Create Request
    async createRequest(req, res) {
        try {
            const request = await prisma.request.create({
                data: {
                    userId: req.body.userId,
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

    // Get All Requests
    async getAllRequests(req, res) {
        try {
            const requests = await prisma.request.findMany({
                include: {
                    user: true,
                    goods: true,
                },
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

    // Get Request by ID
    async getRequestById(req, res) {
        try {
            const request = await prisma.request.findUnique({
                where: { id: parseInt(req.params.id) },
                include: {
                    user: true,
                    goods: true,
                    pickup: true,
                    order: true,
                },
            });

            if (!request) {
                return res.status(404).json({
                    success: false,
                    error: 'Request not found',
                });
            }

            res.status(200).json({
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

    // Update Request
    async updateRequest(req, res) {
        try {
            const request = await prisma.request.update({
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
                data: request,
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
}

module.exports = new RequestController(); 