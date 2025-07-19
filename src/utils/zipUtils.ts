import JSZip from 'jszip';
import { DownloadItem, ZipConfig } from '../types';

export const createZipArchive = async (
  items: DownloadItem[],
  config: ZipConfig
): Promise<Blob> => {
  const zip = new JSZip();

  // Filter only completed items with blobs
  const completedItems = items.filter(item => 
    item.status === 'completed' && item.blob
  );

  if (completedItems.length === 0) {
    throw new Error('No completed downloads to archive');
  }

  // Add all completed files to the ZIP
  for (const item of completedItems) {
    if (item.blob) {
      // Sanitize filename for ZIP compatibility
      const sanitizedFilename = item.filename.replace(/[<>:"/\\|?*]/g, '_');
      
      try {
        zip.file(sanitizedFilename, item.blob);
      } catch (error) {
        console.warn(`Failed to add ${sanitizedFilename} to ZIP:`, error);
        // Continue with other files
      }
    }
  }

  // Add a manifest file with download information
  const manifest = {
    created: new Date().toISOString(),
    totalFiles: completedItems.length,
    files: completedItems.map(item => ({
      filename: item.filename,
      url: item.url,
      size: item.fileSize || 0,
      downloadedSize: item.downloadedSize || 0,
      httpStatus: item.httpStatus,
      downloadedAt: item.endTime ? new Date(item.endTime).toISOString() : null,
    }))
  };

  zip.file('download_manifest.json', JSON.stringify(manifest, null, 2));

  // Generate the ZIP file with fast compression
  try {
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 1 }, // Fast compression
      streamFiles: true, // Better for large files
    });

    return blob;
  } catch (error) {
    throw new Error(`Failed to create ZIP archive: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const downloadZipArchive = (archive: Blob, baseName: string) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `${baseName}_${timestamp}.zip`;
  
  const url = URL.createObjectURL(archive);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  // Add to DOM, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL after a delay to ensure download starts
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};