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

        // Create HTML email template with modern design
        const htmlTemplate = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: 'Helvetica Neue', Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f5f5f5;
                    }
                    .email-wrapper {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #ffffff;
                    }
                    .header {
                        text-align: center;
                        padding: 30px 0;
                        background: linear-gradient(135deg, #0061ff 0%, #60efff 100%);
                        color: white;
                        border-radius: 10px 10px 0 0;
                        margin-bottom: 30px;
                    }
                    .logo {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .welcome-text {
                        font-size: 18px;
                        opacity: 0.9;
                    }
                    .order-info {
                        background-color: #f8f9fa;
                        border-radius: 8px;
                        padding: 20px;
                        margin-bottom: 25px;
                        border: 1px solid #e9ecef;
                    }
                    .order-number {
                        color: #0061ff;
                        font-size: 16px;
                        font-weight: 600;
                    }
                    .details-box {
                        background-color: #fff;
                        border-radius: 8px;
                        padding: 25px;
                        margin: 25px 0;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        border: 1px solid #e9ecef;
                    }
                    .details-title {
                        color: #0061ff;
                        font-size: 18px;
                        font-weight: 600;
                        margin-bottom: 15px;
                        padding-bottom: 10px;
                        border-bottom: 2px solid #e9ecef;
                    }
                    .details-content {
                        padding: 10px;
                        background-color: #f8f9fa;
                        border-radius: 6px;
                        font-family: 'Courier New', monospace;
                    }
                    .footer {
                        margin-top: 30px;
                        padding: 20px;
                        background-color: #f8f9fa;
                        border-radius: 0 0 10px 10px;
                        font-size: 14px;
                        color: #6c757d;
                        text-align: center;
                    }
                    .contact-info {
                        margin: 15px 0;
                    }
                    .social-links {
                        margin-top: 15px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #0061ff;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        margin-top: 15px;
                    }
                    .divider {
                        height: 1px;
                        background-color: #e9ecef;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                <div class="email-wrapper">
                    <div class="header">
                        <div class="logo">WASSALHA</div>
                        <div class="welcome-text">Thank you for choosing our service</div>
                    </div>

                    <p style="font-size: 16px; margin-bottom: 20px;">
                        Dear ${orderSponsor.recipient.name},
                    </p>

                    <p style="margin-bottom: 25px;">
                        We're pleased to inform you that your sponsorship request has been accepted and processed successfully.
                    </p>

                    <div class="order-info">
                        <div class="order-number">Order N° ${orderSponsor.id}</div>
                        <div style="color: #6c757d; margin-top: 5px;">
                            Date: ${new Date().toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>

                    <div class="details-box">
                        <div class="details-title">Your Account Details</div>
                        <div class="details-content">
                            ${accountDetails.type === 'code' 
                                ? `<p><strong>Access Code:</strong><br>${accountDetails.details}</p>`
                                : `<p><strong>Login Credentials</strong><br>
                                   Email: ${accountDetails.details.email}<br>
                                   Password: ${accountDetails.details.password}</p>`
                            }
                        </div>
                    </div>

                    <div style="background-color: #fff3cd; color: #856404; padding: 15px; border-radius: 6px; margin: 20px 0;">
                        <strong>Important:</strong> Please keep these credentials secure and do not share them with anyone.
                    </div>

                    <div class="divider"></div>

                    <div class="footer">
                        <div class="contact-info">
                            Need assistance? We're here to help!<br>
                            <a href="mailto:${process.env.EMAIL_USER}" style="color: #0061ff; text-decoration: none;">
                                ${process.env.EMAIL_USER}
                            </a>
                        </div>
                        
                        <div style="color: #6c757d; margin-top: 15px;">
                            © ${new Date().getFullYear()} Wassalha. All rights reserved.
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        try {
            await transporter.sendMail({
                from: `"Wassalha" <${process.env.EMAIL_USER}>`,
                to: orderSponsor.recipient.email,
                subject: `Your Sponsorship Details - Order #${orderSponsor.id}`,
                html: htmlTemplate
            });
            console.log('Email sent successfully to:', orderSponsor.recipient.email);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
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