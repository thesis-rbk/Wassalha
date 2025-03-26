const prisma = require('../../prisma/index');
const nodemailer = require('nodemailer');

// Configure nodemailer with Gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const acceptRequest = async (req, res) => {
    try {
        console.log('Accepting order:', req.params);
        console.log('Request body:', req.body);
        console.log('User:', req.user);

        const { requestId } = req.params;
        const sponsorId = req.user.id;
        const { accountDetails } = req.body;

        if (!accountDetails) {
            return res.status(400).json({ message: 'Account details are required' });
        }

        // Update order status to confirmed
        const orderSponsor = await prisma.orderSponsor.update({
            where: { 
                id: parseInt(requestId) 
            },
            data: {
                status: 'CONFIRMED',
            },
            include: {
                recipient: true,
                serviceProvider: true,
                sponsorship: true
            }
        });

        if (!orderSponsor) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Format account details for display
        const formattedDetails = accountDetails.type === 'code'
            ? `<p><strong>Your Code:</strong> ${accountDetails.details}</p>`
            : `<p><strong>Email:</strong> ${accountDetails.details.email}<br>
               <strong>Password:</strong> ${accountDetails.details.password}</p>`;

        // Create HTML email template
        const htmlTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { margin-bottom: 30px; }
                    .order-info { 
                        border: 1px solid #ddd;
                        padding: 15px;
                        margin-bottom: 20px;
                        background-color: #f9f9f9;
                    }
                    .details-box {
                        background-color: #fff;
                        border: 1px solid #007AFF;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 5px;
                    }
                    .footer {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        font-size: 12px;
                        color: #666;
                    }
                    .company-name {
                        color: #007AFF;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h2>Bonjour ${orderSponsor.recipient.name}!</h2>
                        <p>Thank you for using our sponsorship service. Your request has been accepted!</p>
                    </div>

                    <div class="order-info">
                        <h3>Order N° ${orderSponsor.id}</h3>
                        <p>Created on: ${new Date().toLocaleDateString()}</p>
                    </div>

                    <div class="details-box">
                        <h3>Your Account Details</h3>
                        ${formattedDetails}
                    </div>

                    <div class="footer">
                        <p>If you have any questions, please contact us at <a href="mailto:${process.env.EMAIL_USER}">${process.env.EMAIL_USER}</a></p>
                        <p>Best regards,<br>
                        <span class="company-name">The Sponsorship Team</span></p>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            // Send email
            await transporter.sendMail({
                from: `"Sponsorship Team" <${process.env.EMAIL_USER}>`,
                to: orderSponsor.recipient.email,
                subject: `Order Confirmation #${orderSponsor.id}`,
                html: htmlTemplate
            });
            console.log('Email sent successfully to:', orderSponsor.recipient.email);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Continue with the response even if email fails
        }

        res.json({ 
            message: 'Order accepted and details sent successfully',
            orderSponsor 
        });

    } catch (error) {
        console.error('Error accepting order:', error);
        res.status(500).json({ 
            message: 'Error accepting order',
            error: error.message 
        });
    }
};

// Export the controller functions
module.exports = {
    acceptRequest
}; 