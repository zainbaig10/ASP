import express from "express";
import multer from "multer";

const router = express.Router();

// STORAGE CONFIG
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ROUTE
router.post("/", upload.single("image"), (req, res) => {
  const baseUrl = process.env.BASE_URL;

  const fullUrl = `${baseUrl}/uploads/products/${req.file.filename}`;

  res.json({
    success: true,
    url: fullUrl,
  });
});



export default router;
