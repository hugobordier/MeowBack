import multer from 'multer';

// export const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, 'uploads/profile-pictures/');
//     },
//     filename: (req, file, cb) => {
//       cb(
//         null,
//         `${req.user!.id}-${Date.now()}${path.extname(file.originalname)}`
//       );
//     },
//   }),
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Type de fichier non autorisé'), false);
//     }
//   },
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
// });
