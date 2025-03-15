const verifySponsor = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const updatedProvider = await prisma.serviceProvider.update({
      where: { userId: parseInt(userId) },
      data: {
        isVerified: true,
        updatedAt: new Date()
      }
    });

    // Update user role to sponsor
    await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { isSponsor: true }
    });

    res.json({
      success: true,
      data: {
        isVerified: updatedProvider.isVerified,
        answers: JSON.parse(updatedProvider.badge)
      }
    });
  } catch (error) {
    console.error('Error verifying sponsor:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify sponsor'
    });
  }
}; 