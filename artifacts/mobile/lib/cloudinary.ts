import * as Crypto from 'expo-crypto';

const CLOUD_NAME = "dlnx7rcut";
const API_KEY = "728635838347177";
const API_SECRET = "fOTN_RRYBa3eyAoDO400tbYRYSg";

export const uploadToCloudinary = async (fileAsset: any, folderPath: string = "materials/General", customTitle: string = ""): Promise<string> => {
  try {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Create a clean readable date, e.g. 25_Jun_2026
    const dateObj = new Date();
    const cleanDate = `${dateObj.getDate()}_${dateObj.toLocaleString('default', { month: 'short' })}_${dateObj.getFullYear()}`;
    
    // Ensure folderPath is safe but allow slashes
    const safeFolder = folderPath.replace(/[^a-zA-Z0-9/_-]/g, "_");
    const safeTitle = customTitle ? customTitle.replace(/[^a-zA-Z0-9]/g, "_") : (fileAsset.name || "upload").replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9]/g, "_");
    
    // Final name: materials/Class12_Commerce/Accounts_Chapter_1_25_Jun_2026
    const publicId = `${safeFolder}/${safeTitle}_${cleanDate}`;
    
    // Cloudinary requires signature parameters to be alphabetical: p (public_id) comes before t (timestamp)
    const strToSign = `public_id=${publicId}&timestamp=${timestamp}${API_SECRET}`;
    
    const signature = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA1,
      strToSign
    );

    const formData = new FormData();
    if (fileAsset.file) {
      // Web
      formData.append("file", fileAsset.file);
    } else {
      // Native
      formData.append("file", {
        uri: fileAsset.uri,
        type: fileAsset.mimeType || "application/octet-stream",
        name: fileAsset.name || "upload",
      } as any);
    }
    
    formData.append("api_key", API_KEY);
    formData.append("timestamp", timestamp);
    formData.append("public_id", publicId);
    formData.append("signature", signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    if (data.secure_url) {
      // Inject q_auto,f_auto for maximum compression and bandwidth saving
      const optimizedUrl = data.secure_url.replace("/upload/", "/upload/q_auto,f_auto/");
      return optimizedUrl;
    } else {
      throw new Error(data.error?.message || "Upload failed");
    }
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};
