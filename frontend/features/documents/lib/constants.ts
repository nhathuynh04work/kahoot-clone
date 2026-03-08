// 50MB total storage limit (matches backend)
export const MAX_TOTAL_STORAGE_BYTES = 50 * 1024 * 1024;

// 10MB per-file limit for upload
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_MIME_TYPES = ["application/pdf"];

export const formatBytes = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
