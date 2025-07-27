import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const validateFiles = (files: Express.Multer.File[]) => {
  const validMimeTypes = ["image/jpeg", "image/png", "image/jpg","image/jfif"];

  const invalidFiles = files.filter(
    (file) => !validMimeTypes.includes(file.mimetype)
  );

  if (invalidFiles.length > 0) {
    return "Only JPEG, JPG, JFIF, and PNG formats are allowed.";
  }
  return null;
};
