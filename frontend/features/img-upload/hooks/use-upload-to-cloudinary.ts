import { useMutation } from "@tanstack/react-query";
import { uploadToCloudinary } from "../api/client-actions";

export const useUploadToCloudinary = () => {
	return useMutation({
		mutationFn: uploadToCloudinary,
	});
};
