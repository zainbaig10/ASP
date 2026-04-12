import fs from "fs";
import path from "path";
import { BlobServiceClient } from "@azure/storage-blob";

const SAS_URL =
  "https://brocklesnar24.blob.core.windows.net/asp?sp=racwdli&st=2026-04-08T15:11:09Z&se=2027-11-12T23:26:09Z&sv=2025-11-05&sr=c&sig=jqXrQmI58MgDxdOTSVVHck3PIdP8OtI%2B0HJ9xtyrkzc%3D";

const IMAGE_FOLDER = path.join(process.cwd(), "uploads/products");

const blobServiceClient = new BlobServiceClient(SAS_URL);

// ⚠️ IMPORTANT: container name must be ""
// because SAS already points to container
const containerClient = blobServiceClient.getContainerClient("");

const uploadImages = async () => {
  const files = fs.readdirSync(IMAGE_FOLDER);

  for (let file of files) {
    try {
      console.log(`⬆️ Uploading: ${file}`);

      const filePath = path.join(IMAGE_FOLDER, file);
      const fileBuffer = fs.readFileSync(filePath);

      // ✅ NO prefix here
      const blockBlobClient =
        containerClient.getBlockBlobClient(file);

      await blockBlobClient.uploadData(fileBuffer, {
        blobHTTPHeaders: {
          blobContentType: "image/jpeg",
        },
      });

      console.log(
        `✅ Uploaded: https://brocklesnar24.blob.core.windows.net/asp/${file}`
      );
    } catch (err) {
      console.log(`❌ Failed: ${file}`, err.message);
    }
  }

  console.log("\n🎉 All images uploaded!");
};

uploadImages();
