import multer from "multer";

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") +
        "-" +
        file.originalname.replace(/\s+/g, "_")
    );
  },
});

const multerConfig = multer({ storage: fileStorage }).single("imageUrl");

export default multerConfig;
