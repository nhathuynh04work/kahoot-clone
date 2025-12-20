import { apiClient } from "@/lib/apiClient";
import axios from "axios";

interface SignatureResponseData {
	signature: string;
	timestamp: number;
	folder: string;
	apiKey: string;
	cloudName: string;
}

export const getSignature = async () => {
	const { data } = await apiClient.get("/upload/signature");
	return data as SignatureResponseData;
};

export const uploadToCloudinary = async (params: {
	formData: FormData;
	cloudName: string;
}) => {
	const { formData, cloudName } = params;

	const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

	const { data } = await axios.post(url, formData);
	return data;
};
