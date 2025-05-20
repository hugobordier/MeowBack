import express, { type Request, type Response } from 'express';
import { exec } from 'child_process';

const router = express.Router();

router.post('/', (req: Request, res: Response) => {
  console.log('🚨 Webhook reçu !');
  exec(
    'git pull origin main && bun install && pm2 restart mon-api',
    (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ Erreur : ${stderr}`);
        return res.status(500).send('Erreur déploiement');
      }
      console.log(`✅ Déploiement terminé : ${stdout}`);
      res.send('Déploiement terminé');
    }
  );
});

export default router;
