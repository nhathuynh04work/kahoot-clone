import { apiClient } from "@/lib/apiClient";

export async function updateAdminUser(
	userId: number,
	payload: { role?: "USER" | "ADMIN"; isBlocked?: boolean },
) {
	const { data } = await apiClient.patch(
		`/admin/users/${userId}`,
		payload,
	);
	return data as {
		id: number;
		email: string;
		name: string | null;
		role: "USER" | "ADMIN";
		isBlocked: boolean;
		createdAt: string;
	};
}

