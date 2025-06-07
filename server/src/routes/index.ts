import type { Request, Response } from 'express';
import express from 'express';
import path from 'path';
import apiRoutes from './api';

const router = express.Router();

router.use('/api', apiRoutes);

// serve up react front-end in production
router.use((_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});

export default router;
