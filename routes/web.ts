// Import packages
import { Router } from 'express';

const routes = Router();



// index page
routes.get('/invoice', function (req, res) {
    const { id } = req.query;
    res.render('pages/invoice', { id });
});

export default routes;