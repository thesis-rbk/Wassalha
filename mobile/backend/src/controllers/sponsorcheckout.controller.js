const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all sponsor checkouts
exports.getAllSponsorCheckouts = async (req, res) => {
    try {
        const sponsorCheckouts = await prisma.sponsorCheckout.findMany({
            include: {
                sponsorship: {
                    include: {
                        category: true,
                        sponsor: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform the data to match the frontend expectations
        const transformedCheckouts = sponsorCheckouts.map(checkout => ({
            ...checkout,
            sponsorship: {
                ...checkout.sponsorship,
                title: `${checkout.sponsorship.platform} Sponsorship`, // Add a title since it's not in the schema
                sponsor: {
                    id: checkout.sponsorship.sponsor.id,
                    name: checkout.sponsorship.sponsor.user?.name || 'Unknown',
                    email: checkout.sponsorship.sponsor.user?.email || 'No email'
                }
            }
        }));

        res.status(200).json({
            success: true,
            data: transformedCheckouts
        });
    } catch (error) {
        console.error('Error getting sponsor checkouts:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving sponsor checkouts',
            error: error.message
        });
    }
};

// Get sponsor checkout by ID
exports.getSponsorCheckoutById = async (req, res) => {
    try {
        const { id } = req.params;
        const sponsorCheckout = await prisma.sponsorCheckout.findUnique({
            where: { id: parseInt(id) },
            include: {
                sponsorship: {
                    include: {
                        category: true,
                        sponsor: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!sponsorCheckout) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor checkout not found'
            });
        }

        // Transform the data
        const transformedCheckout = {
            ...sponsorCheckout,
            sponsorship: {
                ...sponsorCheckout.sponsorship,
                title: `${sponsorCheckout.sponsorship.platform} Sponsorship`,
                sponsor: {
                    id: sponsorCheckout.sponsorship.sponsor.id,
                    name: sponsorCheckout.sponsorship.sponsor.user?.name || 'Unknown',
                    email: sponsorCheckout.sponsorship.sponsor.user?.email || 'No email'
                }
            }
        };

        res.status(200).json({
            success: true,
            data: transformedCheckout
        });
    } catch (error) {
        console.error('Error getting sponsor checkout:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving sponsor checkout',
            error: error.message
        });
    }
};

// Update sponsor checkout status
exports.updateSponsorCheckoutStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status provided'
            });
        }

        const updatedCheckout = await prisma.sponsorCheckout.update({
            where: { id: parseInt(id) },
            data: { status },
            include: {
                sponsorship: {
                    include: {
                        category: true,
                        sponsor: {
                            include: {
                                user: {
                                    select: {
                                        name: true,
                                        email: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Transform the data
        const transformedCheckout = {
            ...updatedCheckout,
            sponsorship: {
                ...updatedCheckout.sponsorship,
                title: `${updatedCheckout.sponsorship.platform} Sponsorship`,
                sponsor: {
                    id: updatedCheckout.sponsorship.sponsor.id,
                    name: updatedCheckout.sponsorship.sponsor.user?.name || 'Unknown',
                    email: updatedCheckout.sponsorship.sponsor.user?.email || 'No email'
                }
            }
        };

        res.status(200).json({
            success: true,
            data: transformedCheckout
        });
    } catch (error) {
        console.error('Error updating sponsor checkout:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating sponsor checkout',
            error: error.message
        });
    }
};

// Delete sponsor checkout
exports.deleteSponsorCheckout = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if the checkout exists first
        const checkout = await prisma.sponsorCheckout.findUnique({
            where: { id: parseInt(id) }
        });

        if (!checkout) {
            return res.status(404).json({
                success: false,
                message: 'Sponsor checkout not found'
            });
        }

        await prisma.sponsorCheckout.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: 'Sponsor checkout deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting sponsor checkout:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting sponsor checkout',
            error: error.message
        });
    }
};
