// ============================================================
// QAF – Quranic Art Fest | ImageKit Configuration
// ============================================================
// ⚠️ NOTE: For production, move private key to a server-side
//    endpoint. This client-side approach is for development only.
// ============================================================

const IMAGEKIT_CONFIG = {
  publicKey: "public_x8uDMJT4JvZWLZcnkjU6ZPzlGAw=",
  privateKey: "private_IYVir0LN50XYY5aoO5omtBD/gdE=",
  urlEndpoint: "https://ik.imagekit.io/ajtjz9iiv",
  uploadUrl: "https://upload.imagekit.io/api/v1/files/upload",
  folder: "/qaf"
};

/**
 * Upload image to ImageKit using private key auth
 * @param {File} file - The file to upload
 * @param {string} subfolder - Subfolder inside /qaf (e.g. 'logos', 'photos')
 * @param {string} fileName - Custom file name (optional)
 * @returns {Promise<Object>} Upload result with url, fileId, etc.
 */
async function uploadToImageKit(file, subfolder = '', fileName = '') {
  const name = fileName || `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const folder = IMAGEKIT_CONFIG.folder + (subfolder ? '/' + subfolder : '');

  // Compress image before upload
  let uploadFile = file;
  if (file.type.startsWith('image/')) {
    uploadFile = await compressImage(file, 1200, 0.85);
  }

  const formData = new FormData();
  formData.append('file', uploadFile);
  formData.append('fileName', name);
  formData.append('folder', folder);
  formData.append('useUniqueFileName', 'true');

  // Basic Auth: base64(privateKey + ":")
  const authHeader = 'Basic ' + btoa(IMAGEKIT_CONFIG.privateKey + ':');

  try {
    const response = await fetch(IMAGEKIT_CONFIG.uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      },
      body: formData
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Upload failed (${response.status})`);
    }

    const result = await response.json();
    console.log('✅ ImageKit upload success:', result.url);
    return result;
  } catch (error) {
    console.error('❌ ImageKit upload error:', error);
    throw error;
  }
}

/**
 * Compress image client-side before upload
 * @param {File} file - Image file
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} quality - Compression quality 0-1
 * @returns {Promise<File>} Compressed file
 */
function compressImage(file, maxWidth = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/webp' }));
            } else {
              resolve(file); // fallback to original
            }
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Get optimized ImageKit CDN URL with transformations
 * @param {string} path - Image path or full URL
 * @param {Object} options - Transformation options
 * @returns {string} Optimized URL
 */
function getImageKitUrl(path, options = {}) {
  const { width, height, quality = 80, blur, format = 'auto', crop } = options;
  let transforms = [];

  if (width) transforms.push(`w-${width}`);
  if (height) transforms.push(`h-${height}`);
  if (quality) transforms.push(`q-${quality}`);
  if (blur) transforms.push(`bl-${blur}`);
  if (format) transforms.push(`f-${format}`);
  if (crop) transforms.push(`c-${crop}`);

  const tr = transforms.length ? `/tr:${transforms.join(',')}` : '';

  // If path is already a full URL, extract the path part
  if (path.startsWith('http')) {
    const url = new URL(path);
    path = url.pathname;
  }

  return `${IMAGEKIT_CONFIG.urlEndpoint}${tr}${path}`;
}

/**
 * Delete image from ImageKit (admin only)
 * @param {string} fileId - ImageKit file ID
 */
async function deleteFromImageKit(fileId) {
  const authHeader = 'Basic ' + btoa(IMAGEKIT_CONFIG.privateKey + ':');
  try {
    await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: { 'Authorization': authHeader }
    });
    console.log('🗑️ ImageKit file deleted:', fileId);
  } catch (error) {
    console.error('Delete error:', error);
  }
}

// Export to global scope
window.ImageKitService = {
  uploadToImageKit,
  getImageKitUrl,
  compressImage,
  deleteFromImageKit,
  config: IMAGEKIT_CONFIG
};
