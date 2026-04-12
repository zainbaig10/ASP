import axios from "axios";
import xlsx from "xlsx";
import dotenv from "dotenv";
import { parseStringPromise } from "xml2js";

dotenv.config();

// -----------------------------
// CONFIG
// -----------------------------
const API_URL =
  "https://asp.hafeezmulla.in:4050/api/v1/product/create-product";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWJhOGM0MzhkYTQ3NjIwZTRjY2MyZGYiLCJyb2xlIjoiQURNSU4iLCJidXNpbmVzc0lkIjoiNjliODc0NDAyODkxMmI5ZWJkMDM1NjlmIiwiaXNTdXBlckFkbWluIjpmYWxzZSwiaWF0IjoxNzc1NDkyOTgyLCJleHAiOjE3NzgwODQ5ODJ9.VQYUwCZPoqfNAtDznRq3K1S9fuQVzOLkgVB2PJGCYEs";

// 🔥 SAS URL
const SAS_URL =
  "https://brocklesnar24.blob.core.windows.net/asp?sp=racwdli&st=2026-04-08T15:11:09Z&se=2027-11-12T23:26:09Z&sv=2025-11-05&sr=c&sig=jqXrQmI58MgDxdOTSVVHck3PIdP8OtI%2B0HJ9xtyrkzc%3D";

const BLOB_BASE_URL =
  "https://brocklesnar24.blob.core.windows.net/asp";

// -----------------------------
// CATEGORY MAP
// -----------------------------
const categoryMap = {
  socks: "69c957b6e05268e099468bcd",
  "mobility aids": "69c9585be05268e099468be3",
  "medical & general products": "69b8744028912b9ebd03569f",
  "knee & joint supports": "69c95828e05268e099468bdb",
  "foot care": "69c95841e05268e099468bdf",
  "cushions & pillows": "69c8a8ce7a0b1343b97589ab",
  "back & body support": "69c957f5e05268e099468bd7",
};

// -----------------------------
// LOAD EXCEL
// -----------------------------
const workbook = xlsx.readFile("./scripts/ASP-Product-List 2027-(1).xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];

const rawProducts = xlsx.utils.sheet_to_json(sheet);

// 🔥 CLEAN KEYS
const products = rawProducts.map((row) => {
  const newRow = {};
  Object.keys(row).forEach((key) => {
    newRow[key.trim().toLowerCase()] = row[key];
  });
  return newRow;
});

// -----------------------------
// BLOB FILES
// -----------------------------
let blobFiles = [];

// -----------------------------
// FETCH IMAGES
// -----------------------------
const buildBlobMap = async () => {
  const res = await axios.get(
    SAS_URL + "&restype=container&comp=list"
  );

  const parsed = await parseStringPromise(res.data);
  const blobs = parsed.EnumerationResults.Blobs[0].Blob;

  blobFiles = blobs.map((b) => b.Name[0]);

  console.log("✅ Total images:", blobFiles.length);
};

// -----------------------------
// GET IMAGES
// -----------------------------
const getImages = (productCode) => {
  const code = productCode.toLowerCase();

  const matched = blobFiles.filter((file) =>
    file.toLowerCase().includes(code)
  );

  return matched.map(
    (file) => `${BLOB_BASE_URL}/${file}?${SAS_URL.split("?")[1]}`
  );
};

// -----------------------------
// UPLOAD
// -----------------------------
const uploadProducts = async () => {
  let success = 0;
  let failed = 0;

  for (let i = 0; i < products.length; i++) {
    const row = products[i];

    try {
      const productCode = row["productcode"]?.toString().trim();
      const name_en = row["name_en"]?.toString().trim();
      const categoryName = row["category"]?.toString().trim().toLowerCase();

      const categoryId = categoryMap[categoryName];

      // 🔥 VALIDATION
      if (!productCode || !name_en || !categoryId) {
        console.log(`⚠️ Skipped: ${productCode} (missing data)`);
        continue;
      }

      const payload = {
        name_en,
        name_ar: row["name_ar"] || "",
        productCode,
        categoryId,
        description_en: row["description_en"] || "",
        description_ar: row["description_ar"] || "",
        images: getImages(productCode),
        variants: {
          sizes: row["sizes"]
            ? row["sizes"].split("|").map((s) => s.trim())
            : [],
          colors: row["colors"]
            ? row["colors"].split("|").map((c) => c.trim())
            : [],
          packSizes: [],
        },
        badge: row["badge"] || "NEW",
      };

      await axios.post(API_URL, payload, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      console.log(`✅ Uploaded: ${name_en}`);
      success++;
    } catch (err) {
      console.log(`❌ Failed:`, err.response?.data || err.message);
      failed++;
    }
  }

  console.log("\n🎉 Upload Completed");
  console.log("✅ Success:", success);
  console.log("❌ Failed:", failed);
};

// -----------------------------
// START
// -----------------------------
const start = async () => {
  await buildBlobMap();
  await uploadProducts();
};

start();
