import express from "express";

import reviews from '../review/review.route'

const router = express.Router();

router.use('/review', reviews);

export default router;