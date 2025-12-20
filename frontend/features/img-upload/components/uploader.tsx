"use client";

import { ChangeEvent, ReactNode, useRef, useState } from "react";
import { useGetSignature } from "../hooks/useGetSignature";
import { useUploadToCloudinary } from "../hooks/useUploadToCloudinary";

interface UploaderProps {
	children: (props: {
		triggerUpload: () => void;
		isUploading: boolean;
		error: string | null;
	}) => ReactNode;
	onUploadSuccess: (url: string) => Promise<void> | void;
}

export const Uploader = ({ children, onUploadSuccess }: UploaderProps) => {
	const inputRef = useRef<HTMLInputElement>(null);
	const { mutateAsync: getSignature } = useGetSignature();
	const { mutateAsync: uploadToCloudinary } = useUploadToCloudinary();

	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState(null);

	const triggerUpload = () => {
		inputRef.current?.click();
	};

	const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setError(null);
		setIsUploading(true);

		try {
			const signatureData = await getSignature();

			const { signature, timestamp, folder, apiKey, cloudName } =
				signatureData;

			const formData = new FormData();
			formData.append("file", file);
			formData.append("api_key", apiKey);
			formData.append("timestamp", timestamp.toString());
			formData.append("signature", signature);
			formData.append("folder", folder);

			const res = await uploadToCloudinary({
				formData,
				cloudName,
			});

			await onUploadSuccess(res.secure_url);
		} catch (error: any) {
			setError(error.message);
		} finally {
			setIsUploading(false);
			if (inputRef.current) inputRef.current.value = "";
		}
	};

	return (
		<>
			<input
				type="file"
				ref={inputRef}
				onChange={handleFileChange}
				className="hidden"
			/>

			{children({
				isUploading,
				error,
				triggerUpload,
			})}
		</>
	);
};
