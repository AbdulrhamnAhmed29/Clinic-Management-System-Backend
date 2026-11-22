import cloudinary from "../../../config/cloudinary.js";
import { uploadBufferToCloudinary } from "../services/uploadImagesServices.js";
export const uploadImagesControllers = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "برجاء إرفاق صورة أولاً" });
    }
    const uploaded = await uploadBufferToCloudinary(req.file.buffer);
    return res.status(200).json({
      message: "تم رفع الصورة بنجاح",
      url: uploaded.secure_url,      
      publicId: uploaded.public_id,
    });
  } catch (error) {
    res.status(500).json({
      success:false , 
      message:"faild upload image "
    })
        next(error);
  }
};