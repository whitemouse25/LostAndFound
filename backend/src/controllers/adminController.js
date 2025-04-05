const Item = require('../models/Item');
const { sendEmail } = require('../../utils/emailService');
const QRCode = require('qrcode');
const fs = require('fs').promises;
const path = require('path');

// Test QR code generation
const generateTestQR = async () => {
    try {
        const testData = { test: 'Hello World' };
        const qrCode = await QRCode.toDataURL(JSON.stringify(testData));
        console.log('Test QR code generated successfully');
        return qrCode;
    } catch (error) {
        console.error('Test QR code generation failed:', error);
        throw error;
    }
};

// Send verification code to user
exports.sendVerificationCode = async (req, res) => {
    let txtFilePath = null;
    
    try {
        const { itemId, email } = req.body;
        console.log('Received request:', { itemId, email });

        // Validate input
        if (!itemId || !email) {
            return res.status(400).json({ message: 'Item ID and email are required' });
        }

        // Find the item
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        console.log('Found item:', item);

        // Create text content with item information
        const textContent = `
LOST AND FOUND ITEM VERIFICATION
--------------------------------
Item ID: ${item._id}
Title: ${item.title || 'N/A'}
Category: ${item.category || 'N/A'}
Description: ${item.description || 'N/A'}
Location: ${item.location || 'N/A'}
Date: ${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
--------------------------------
To claim this item, please use the Item ID above on the claim form.
Please keep this information secure.
        `;

        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(__dirname, '../../uploads');
        await fs.mkdir(uploadsDir, { recursive: true });

        // Create text file with item information
        const txtFileName = `item_${item._id}_${Date.now()}.txt`;
        txtFilePath = path.join(uploadsDir, txtFileName);
        
        // Write text file
        await fs.writeFile(txtFilePath, textContent);
        console.log('Text file created successfully at:', txtFilePath);

        // Read text file for email attachment
        const txtFileBuffer = await fs.readFile(txtFilePath);

        // Send email with text file
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Item Claim Information</h2>
                <p>Hello,</p>
                <p>You have requested to claim the following item:</p>
                <ul>
                    <li><strong>Item ID:</strong> ${item._id}</li>
                    <li><strong>Item Name:</strong> ${item.title || 'N/A'}</li>
                    <li><strong>Category:</strong> ${item.category || 'N/A'}</li>
                    <li><strong>Description:</strong> ${item.description || 'N/A'}</li>
                    <li><strong>Location:</strong> ${item.location || 'N/A'}</li>
                    <li><strong>Date:</strong> ${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}</li>
                </ul>
                <p>To claim this item, please use the Item ID above on the claim form.</p>
                <p style="color: #666; font-size: 14px;">Note: This information will be used to verify your claim.</p>
                <p>If you did not request this information, please ignore this email.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
            </div>
        `;

        console.log('Attempting to send email to:', email);
        
        const emailData = {
            to: email,
            subject: 'Item Claim Information',
            html: emailHtml,
            attachments: [
                {
                    filename: txtFileName,
                    content: txtFileBuffer
                }
            ]
        };

        console.log('Email data prepared:', {
            to: emailData.to,
            subject: emailData.subject,
            hasAttachments: !!emailData.attachments,
            attachmentFilenames: emailData.attachments.map(a => a.filename)
        });

        await sendEmail(emailData);
        console.log('Email sent successfully');

        // Clean up files after successful email send
        if (txtFilePath) await fs.unlink(txtFilePath).catch(console.error);
        console.log('Files cleaned up');

        res.json({
            success: true,
            message: 'Item information sent successfully'
        });
    } catch (error) {
        console.error('Detailed error in sendVerificationCode:', error);
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
        
        // Clean up files in case of error
        if (txtFilePath) await fs.unlink(txtFilePath).catch(console.error);
        
        res.status(500).json({ 
            success: false,
            message: 'Error sending item information',
            error: error.message,
            details: error.response?.body || 'No additional details'
        });
    }
};

// Verify claim using item ID
exports.verifyClaim = async (req, res) => {
    try {
        const { itemId, firstName, lastName, email, phone } = req.body;

        // Validate input
        if (!itemId || !firstName || !lastName || !email || !phone) {
            return res.status(400).json({ 
                success: false,
                message: 'All fields are required',
                details: 'Please provide item ID and all contact information'
            });
        }

        // Find the item
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ 
                success: false,
                message: 'Item not found',
                details: 'The item ID provided could not be found'
            });
        }

        // Check if item is already claimed or has a pending claim
        if (item.status === 'approved' || item.status === 'pending') {
            return res.status(400).json({ 
                success: false,
                message: 'Item already claimed',
                details: 'This item has already been claimed by someone else'
            });
        }

        // Update item with claim details
        item.status = 'pending';
        item.claimedBy = {
            firstName,
            lastName,
            email,
            phoneNumber: phone,
            claimedAt: new Date()
        };
        await item.save();

        res.json({
            success: true,
            message: 'Item claim submitted successfully',
            data: {
                itemId: item._id,
                title: item.title,
                status: item.status,
                claimedBy: item.claimedBy
            }
        });
    } catch (error) {
        console.error('Error verifying claim:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error verifying claim',
            error: error.message
        });
    }
};

// Get all claim requests
exports.getClaimRequests = async (req, res) => {
    try {
        console.log('Fetching claim requests...');
        
        // Find all items with claim-related statuses and claimedBy information
        const claims = await Item.find({ 
            $or: [
                { status: 'pending' },
                { status: 'claimed' },
                { status: 'rejected' }
            ],
            'claimedBy.email': { $exists: true }
        }).sort({ 'claimedBy.claimedAt': -1 });

        console.log(`Found ${claims.length} claim requests`);
        
        // Log each claim for debugging
        claims.forEach(claim => {
            console.log('Claim:', {
                id: claim._id,
                title: claim.title,
                status: claim.status,
                claimant: claim.claimedBy ? {
                    name: `${claim.claimedBy.firstName} ${claim.claimedBy.lastName}`,
                    email: claim.claimedBy.email
                } : 'No claimant info'
            });
        });

        res.json({
            success: true,
            claims: claims.map(claim => ({
                _id: claim._id,
                    title: claim.title,
                description: claim.description,
                    category: claim.category,
                    location: claim.location,
                status: claim.status,
                claimedBy: claim.claimedBy,
                createdAt: claim.createdAt,
                updatedAt: claim.updatedAt
            }))
        });
    } catch (error) {
        console.error('Error fetching claim requests:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching claim requests',
            error: error.message
        });
    }
};

// Approve a claim request
exports.approveClaim = async (req, res) => {
    try {
        const { claimId } = req.params;
        console.log('Approving claim with ID:', claimId);
        
        const item = await Item.findById(claimId);
        if (!item) {
            console.log('Item not found with ID:', claimId);
            return res.status(404).json({
                success: false,
                message: 'Claim request not found'
            });
        }

        console.log('Found item:', {
            id: item._id,
            title: item.title,
            status: item.status
        });

        if (item.status !== 'pending') {
            console.log('Invalid status for approval:', item.status);
            return res.status(400).json({
                success: false,
                message: 'Invalid claim status',
                details: 'This claim has already been processed'
            });
        }

        // Update item status to claimed
        console.log('Updating status from', item.status, 'to claimed');
        item.status = 'claimed';
        await item.save();
        console.log('Item saved successfully');

        // Send email notification to claimant
        if (item.claimedBy && item.claimedBy.email) {
            console.log('Sending email to:', item.claimedBy.email);
            try {
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Claim Request Approved</h2>
                        <p>Hello ${item.claimedBy.firstName},</p>
                        <p>Your claim request for the following item has been approved:</p>
                        <ul>
                            <li><strong>Item:</strong> ${item.title}</li>
                            <li><strong>Category:</strong> ${item.category}</li>
                            <li><strong>Location:</strong> ${item.location}</li>
                        </ul>
                        <p>Please visit the Lost and Found office to collect your item.</p>
                        <p>Bring a valid ID for verification.</p>
                        <hr>
                        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
                    </div>
                `;

                await sendEmail({
                    to: item.claimedBy.email,
                    subject: 'Claim Request Approved',
                    html: emailHtml
                });
                console.log('Email sent successfully');
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                // Continue with the response even if email fails
            }
        } else {
            console.log('No email sent - missing claimant information');
        }

        res.json({
            success: true,
            message: 'Claim request approved successfully'
        });
    } catch (error) {
        console.error('Error approving claim:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error approving claim',
            error: error.message
        });
    }
};

// Reject a claim request
exports.rejectClaim = async (req, res) => {
    try {
        const { claimId } = req.params;
        console.log('Rejecting claim with ID:', claimId);
        
        const item = await Item.findById(claimId);
        if (!item) {
            console.log('Item not found with ID:', claimId);
            return res.status(404).json({
                success: false,
                message: 'Claim request not found'
            });
        }

        console.log('Found item:', {
            id: item._id,
            title: item.title,
            status: item.status
        });

        if (item.status !== 'pending') {
            console.log('Invalid status for rejection:', item.status);
            return res.status(400).json({
                success: false,
                message: 'Invalid claim status',
                details: 'This claim has already been processed'
            });
        }

        // Update item status to rejected
        console.log('Updating status from', item.status, 'to rejected');
        item.status = 'rejected';
        await item.save();
        console.log('Item saved successfully');

        // Send email notification to claimant
        if (item.claimedBy && item.claimedBy.email) {
            console.log('Sending email to:', item.claimedBy.email);
            try {
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #333;">Claim Request Rejected</h2>
                        <p>Hello ${item.claimedBy.firstName},</p>
                        <p>Your claim request for the following item has been rejected:</p>
                        <ul>
                            <li><strong>Item:</strong> ${item.title}</li>
                            <li><strong>Category:</strong> ${item.category}</li>
                            <li><strong>Location:</strong> ${item.location}</li>
                        </ul>
                        <p>If you believe this is an error, please contact the Lost and Found office.</p>
                        <hr>
                        <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
                    </div>
                `;

                await sendEmail({
                    to: item.claimedBy.email,
                    subject: 'Claim Request Rejected',
                    html: emailHtml
                });
                console.log('Email sent successfully');
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                // Continue with the response even if email fails
            }
        } else {
            console.log('No email sent - missing claimant information');
        }

        res.json({
            success: true,
            message: 'Claim request rejected successfully'
        });
    } catch (error) {
        console.error('Error rejecting claim:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error rejecting claim',
            error: error.message
        });
    }
}; 