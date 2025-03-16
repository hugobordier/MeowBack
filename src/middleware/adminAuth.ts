import type { Request, Response, NextFunction } from 'express';

const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: 'Accès refusé (rôle admin requis)' });
    }

    next();
  } catch (error: any) {
    console.error('Error in admin authorization middleware:', error);
    return res.status(500).json({
      message: "Erreur d'autorisation",
      error: error.message,
    });
  }
};

export default adminAuth;
