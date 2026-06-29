const express = require('express');
const router = express.Router();
const prisma = require('../../models');
const { authenticate } = require('../../middlewares/auth.middleware');

// Get all invoices for the organization
router.get('/invoices', authenticate, async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const invoices = await prisma.invoice.findMany({
            where: { organizationId },
            include: {
                client: {
                    select: { id: true, name: true, email: true }
                },
                payments: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: invoices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new invoice
router.post('/invoices', authenticate, async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { clientId, amount, currency, dueDate } = req.body;

        const invoice = await prisma.invoice.create({
            data: {
                organizationId,
                clientId,
                amount: parseFloat(amount),
                currency: currency || 'USD',
                dueDate: new Date(dueDate),
                status: 'UNPAID'
            }
        });

        // Audit log entry
        await prisma.auditLog.create({
            data: {
                organizationId,
                userId: req.user.id,
                action: 'INVOICE_CREATION',
                tableName: 'Invoice',
                recordId: invoice.id,
                newValues: { amount, status: 'UNPAID' }
            }
        });

        res.status(201).json({ success: true, data: invoice });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Pay invoice (mock payment gateway)
router.post('/invoices/:invoiceId/pay', authenticate, async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const { invoiceId } = req.params;
        const { gateway, amount } = req.body;

        // Verify ownership and fetch details
        const invoice = await prisma.invoice.findFirst({
            where: { id: invoiceId, organizationId }
        });

        if (!invoice) {
            return res.status(404).json({ success: false, error: 'Invoice not found' });
        }

        if (invoice.status === 'PAID') {
            return res.status(400).json({ success: false, error: 'Invoice already paid' });
        }

        // Apply transaction
        const updatedInvoice = await prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'PAID' }
        });

        const payment = await prisma.payment.create({
            data: {
                invoiceId,
                paymentGateway: gateway || 'STRIPE',
                transactionReference: `ch_mock_${Math.random().toString(36).substring(2, 12)}`,
                amount: amount ? parseFloat(amount) : invoice.amount,
                status: 'SUCCESS'
            }
        });

        // Audit log entry
        await prisma.auditLog.create({
            data: {
                organizationId,
                userId: req.user.id,
                action: 'INVOICE_PAID',
                tableName: 'Invoice',
                recordId: invoice.id,
                oldValues: { status: 'UNPAID' },
                newValues: { status: 'PAID', paymentId: payment.id }
            }
        });

        res.json({
            success: true,
            data: {
                invoice: updatedInvoice,
                payment
            }
        });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Get organization audit logs
router.get('/audit-logs', authenticate, async (req, res) => {
    try {
        const organizationId = req.user.organizationId;
        const logs = await prisma.auditLog.findMany({
            where: { organizationId },
            include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
