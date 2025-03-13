const prisma = require("../../prisma/index");

// Fetch all payments
exports.getPayments = async (req, res) => {
    try {
        const payments = await prisma.payment.findMany();
        res.status(200).json({
            success: true,
            data: payments,
        });
    } catch (error) {
        console.error("Error fetching payments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch payments",
            error: error.message,
        });
    }
};

// Create a new payment
exports.createPayment = async (req, res) => {
    const { orderId, amount, currency, status, paymentMethod } = req.body;

    try {
        const newPayment = await prisma.payment.create({
            data: {
                orderId,
                amount,
                currency,
                status,
                paymentMethod,
            },
        });
        res.status(201).json({
            success: true,
            data: newPayment,
        });
    } catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create payment",
            error: error.message,
        });
    }
};

// Update a payment
exports.updatePayment = async (req, res) => {
    const { id } = req.params;
    const { amount, currency, status, paymentMethod } = req.body;

    try {
        const updatedPayment = await prisma.payment.update({
            where: { id: parseInt(id) },
            data: {
                amount,
                currency,
                status,
                paymentMethod,
            },
        });
        res.status(200).json({
            success: true,
            data: updatedPayment,
        });
    } catch (error) {
        console.error("Error updating payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update payment",
            error: error.message,
        });
    }
};

// Delete a payment
exports.deletePayment = async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.payment.delete({
            where: { id: parseInt(id) },
        });
        res.status(200).json({
            success: true,
            message: "Payment deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting payment:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete payment",
            error: error.message,
        });
    }
}; 