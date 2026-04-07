import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminManagementShell } from "@/features/admin/components/admin-management-shell";
import { getAdminUserDetail } from "@/features/admin/api/server-actions";
import { AdminDetailShell, AdminKeyValueGrid } from "@/features/admin/components/admin-detail-shell";

export const metadata: Metadata = {
	title: "Admin user detail",
};

function formatDateTime(iso: string) {
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

export default async function AdminUserDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const userId = parseInt(id, 10);
	if (!Number.isFinite(userId)) redirect("/admin/users");

	const user = await getAdminUserDetail(userId);

	return (
		<AdminManagementShell
			crumbs={[
				{ label: "Admin", href: "/admin" },
				{ label: "Users", href: "/admin/users" },
				{ label: user.email },
			]}
		>
			<AdminDetailShell>
				<AdminKeyValueGrid
					items={[
						{ label: "User id", value: user.id },
						{ label: "Email", value: user.email },
						{ label: "Name", value: user.name ?? "—" },
						{ label: "Role", value: user.role },
						{ label: "Status", value: user.isBlocked ? "BLOCKED" : "ACTIVE" },
						{ label: "Created", value: formatDateTime(user.createdAt) },
						{ label: "Stripe customer", value: user.stripeCustomerId ?? "—" },
						{
							label: "Subscription",
							value: user.subscription
								? `${user.subscription.status}`
								: "—",
						},
						{
							label: "Subscription cancel scheduled",
							value: user.subscription
								? (user.subscription.cancelAtPeriodEnd ? "YES" : "NO")
								: "—",
						},
						{
							label: "Subscription period end",
							value: user.subscription
								? formatDateTime(user.subscription.currentPeriodEnd)
								: "—",
						},
						{ label: "Quizzes", value: user._count.quizzes.toLocaleString() },
						{ label: "Documents", value: user._count.documents.toLocaleString() },
						{ label: "Sessions hosted", value: user._count.lobbies.toLocaleString() },
						{ label: "Quiz saves", value: user._count.quizSaves.toLocaleString() },
						{ label: "Document saves", value: user._count.documentSaves.toLocaleString() },
					]}
				/>
			</AdminDetailShell>
		</AdminManagementShell>
	);
}

