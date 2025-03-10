const prisma = require('../../prisma');

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
}

module.exports = new ServiceProviderController(); 