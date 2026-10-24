
import fs from "node:fs";
import path from "node:path";

const galleryRoot = path.resolve("public/gallery");
const outputFile = path.resolve("src/data/gallery.js");

const supportedExtensions = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
]);

// Preferred display order. Any additional folders are appended automatically.
const categoryOrder = [
  "orientations",
  "techfieesta_26",
  "workshops",
  "competitions",
  "community",
  "events-celebrations",
  "outreach",
];

function getImages(directory) {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return getImages(fullPath);
      }

      if (
        supportedExtensions.has(
          path.extname(entry.name).toLowerCase()
        )
      ) {
        return [fullPath];
      }

      return [];
    })
    .sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
}

function getCategory(filePath) {
  const relativePath = path.relative(galleryRoot, filePath);
  const folder = path.dirname(relativePath);

  return folder === "."
    ? "Uncategorized"
    : folder.split(path.sep)[0];
}

function getCategoryFolders(directory) {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

if (!fs.existsSync(galleryRoot)) {
  console.error(`Gallery directory not found: ${galleryRoot}`);
  process.exit(1);
}

// Discover top-level category folders, including empty folders.
const discoveredFolders = getCategoryFolders(galleryRoot);

const orderedFolders = [
  ...categoryOrder.filter((category) =>
    discoveredFolders.includes(category)
  ),
  ...discoveredFolders
    .filter((category) => !categoryOrder.includes(category))
    .sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: "base" })
    ),
];

// Include Uncategorized only if images exist directly inside public/gallery.
const files = getImages(galleryRoot).sort((a, b) => {
  const categoryA = path.relative(galleryRoot, a).split(path.sep)[0];
  const categoryB = path.relative(galleryRoot, b).split(path.sep)[0];

  if (categoryA !== categoryB) {
    return categoryA.localeCompare(categoryB);
  }

  const numberA = Number(path.basename(a).match(/\d+/)?.[0] ?? 0);
  const numberB = Number(path.basename(b).match(/\d+/)?.[0] ?? 0);

  return numberA - numberB;
});

const galleryData = files.map((file, index) => {
  const relativePath = path.relative("public", file)
    .split(path.sep)
    .join("/");

  return {
    id: index + 1,
    src: `/${relativePath}`,
    category: getCategory(file),
    alt: `IEEE Student Branch ZHCET AMU gallery photo ${index + 1}`,
  };
});

const hasUncategorizedImages = galleryData.some(
  (image) => image.category === "Uncategorized"
);

const galleryCategories = [
  ...orderedFolders,
  ...(hasUncategorizedImages ? ["Uncategorized"] : []),
];

fs.mkdirSync(path.dirname(outputFile), { recursive: true });

fs.writeFileSync(
  outputFile,
  `export const galleryData = ${JSON.stringify(galleryData, null, 2)};\n\n` +
  `export const galleryCategories = ${JSON.stringify(galleryCategories, null, 2)};\n`
);

console.log(`Generated gallery data for ${galleryData.length} images.`);
console.log(`Discovered ${galleryCategories.length} categories.`);
console.log(`Saved to: ${outputFile}`);
