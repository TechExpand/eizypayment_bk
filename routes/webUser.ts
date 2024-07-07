// Import packages
import { Router } from 'express';
import { WithdrawTypeState, Withdrawal, WithdrawalStatus } from '../models/Withdrawal';
import { Users } from '../models/Users';
import { Tokens } from '../models/Token';
import { UserTokens } from '../models/UserToken';
import { ServiceType, TransactionStatus, TransactionType, Transactions } from '../models/Transaction';
import { createRandomRef } from '../helpers/utility';
import { sendEmail, sendFcmNotification } from '../services/notification';
import { templateEmail } from '../config/template';
import { Admin } from '../models/Admin';
import axios from 'axios';
import { Invoice } from '../models/Invoice';
import { Op } from 'sequelize';

const routes = Router();




routes.get('/buy', async function (req, res) {
    const address = ""
    const { id } = req.query
    res.render('pages/fiat-buy', { address, invoiceId: id });
});



routes.get('/sell', async function (req, res) {

    res.render('pages/fiat-sell', { invoiceId: "invoiceId" });
});






routes.get('/preview', async function (req, res) {
    const { id } = req.query
    const invoice = await Invoice.findOne({ where: { randoId: id } })
    console.log(invoice?.lineItems)
    res.render('pages/preview', { invoice });
});






routes.get('/admin/invoice-fiat-overview', async function (req, res) {
    const { id } = req.query;
    const invoice = await Invoice.findOne({
        where: {
            id,
        }, include: [{ model: Users }]
    })
    const generateMailtoLink = () => {
        const recipientEmail = invoice?.user.email;
        return `mailto:${recipientEmail}`;
    };

    res.render('pages/invoice-fiat-overview', {
        invoice, generateMailtoLink
    });
});




routes.get('/admin/invoice-fiat', async function (req, res) {
    const { page } = req.query
    const perPage = 5;
    const currentPage = page || 1;
    const invoice = await Invoice.findAll({
        where: {
            // processedForFiat: true,
            // status: "PROCESSING"
            [Op.or]: [
                { '$status$': { [Op.like]: '%' + "PROCESSING" + '%' } },

            ]
        },
        offset: (perPage * Number(currentPage)) - perPage,
        limit: perPage,
        order: [
            ['createdAt', 'DESC'],
        ],
    })


    const count = await Invoice.count();
    res.render('pages/invoice-fiat', {
        invoice, current: page,
        pages: Math.ceil(count / perPage)
    });
});




export default routes;