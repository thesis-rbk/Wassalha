const prisma = require('../../prisma/index');

class ServiceProviderController {
    // Check if user is a service provider
    async checkServiceProvider(req, res) {
        try {
            const userId = parseInt(req.params.id);
            console.log('🔍 Checking service provider status for user:', userId);
            
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required'
                });
            }

            // Check if user exists as a service provider
            const serviceProvider = await prisma.serviceProvider.findFirst({
                where: {
                    userId: userId
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            });

            console.log('🔍 Service provider check result:', serviceProvider ? 'Found' : 'Not found');

            return res.status(200).json({
                success: true,
                data: {
                    isServiceProvider: !!serviceProvider,
                    details: serviceProvider
                }
            });

        } catch (error) {
            console.error('❌ Error in checkServiceProvider:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to check service provider status',
                error: error.message
            });
        }
    }

    // Fetch all service providers with required fields
    async getAllServiceProviders(req, res) {
        try {
            console.log('Fetching all service providers...');
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
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            
            console.log(`Found ${serviceProviders.length} service providers`);
            
            res.status(200).json({
                success: true,
                data: serviceProviders
            });
        } catch (error) {
            console.error("Error fetching service providers:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch service providers",
                error: error.message
            });
        }
    }

    // Get service provider by user ID
    async getServiceProviderByUserId(req, res) {
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
    }

    // Add a delete service provider method
    async deleteServiceProvider(req, res) {
        const { id } = req.params;
        try {
            const deletedProvider = await prisma.serviceProvider.delete({
                where: { id: parseInt(id) },
            });

            if (deletedProvider) {
                return res.status(200).json({
                    success: true,
                    message: 'Service provider deleted successfully',
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: 'Service provider not found',
                });
            }
        } catch (error) {
            console.error('Error deleting service provider:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete service provider',
                error: error.message,
            });
        }
    }

    async verifySponsor(req, res) {
        try {
            const { userId } = req.params;
            
            // Update both ServiceProvider and Profile
            const [updatedProvider, updatedProfile] = await prisma.$transaction([
                prisma.serviceProvider.update({
                    where: { userId: parseInt(userId) },
                    data: {
                        isVerified: true,
                        updatedAt: new Date()
                    }
                }),
                prisma.profile.update({
                    where: { userId: parseInt(userId) },
                    data: {
                        isSponsor: true,
                        isVerified: true
                    }
                })
            ]);

            res.json({
                success: true,
                data: {
                    serviceProvider: updatedProvider,
                    profile: updatedProfile
                }
            });
        } catch (error) {
            console.error('Error verifying sponsor:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to verify sponsor',
                error: error.message
            });
        }
    }
}

module.exports = new ServiceProviderController(); 