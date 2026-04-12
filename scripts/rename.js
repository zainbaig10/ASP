import fs from "fs";
import path from "path";

const folderPath = "./uploads/products";

const files = fs.readdirSync(folderPath);

files.forEach((file) => {
  const oldPath = path.join(folderPath, file);

  const newName = file
    .replace(/#/g, "_")
    .replace(/\+/g, "_")
    .replace(/\s+/g, "_");

  const newPath = path.join(folderPath, newName);

  if (oldPath !== newPath) {
    fs.renameSync(oldPath, newPath);
    console.log(`Renamed: ${file} → ${newName}`);
  }
});

console.log("✅ Rename completed");
