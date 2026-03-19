import { useMutation } from "@tanstack/react-query";
import { getSignature } from "../api/client-actions";

export const useGetSignature = () => {
	return useMutation({
		mutationFn: getSignature,
	});
};
