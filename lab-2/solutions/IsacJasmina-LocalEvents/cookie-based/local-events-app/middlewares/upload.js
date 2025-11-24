import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = 'public/images';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif/;
  const mimetype = allowed.test(file.mimetype);
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) return cb(null, true);

  const err = new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname);
  err.message = "Doar imagini JPG, PNG sau GIF sunt permise";
  return cb(err);
};

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter
});

export default upload;
