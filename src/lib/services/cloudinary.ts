import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type ImageSize = "thumbnail" | "card" | "full";

const SIZE_TRANSFORMS: Record<ImageSize, object[]> = {
  thumbnail: [{ width: 120, height: 120, crop: "fill", gravity: "auto" }, { quality: "auto:low", fetch_format: "auto" }],
  card: [{ width: 600, height: 600, crop: "limit" }, { quality: "auto:good", fetch_format: "auto" }],
  full: [{ width: 1600, height: 1600, crop: "limit" }, { quality: "auto:best", fetch_format: "auto" }],
};

export async function uploadImage(
  dataUri: string,
  folder = "college-bazaar",
  size: ImageSize = "full"
) {
  const res = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: SIZE_TRANSFORMS[size],
  });
  return { url: res.secure_url, publicId: res.public_id };
}

export async function deleteImage(publicId: string) {
  await cloudinary.uploader.destroy(publicId);
}

/** Generate a signed URL for a Cloudinary publicId at a given size */
export function getImageUrl(publicId: string, size: ImageSize = "card"): string {
  return cloudinary.url(publicId, {
    transformation: SIZE_TRANSFORMS[size],
    secure: true,
  });
}
