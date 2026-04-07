import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminManagementShell } from "@/features/admin/components/admin-management-shell";
import { getAdminDocumentDetail } from "@/features/admin/api/server-actions";
import { AdminDetailShell, AdminKeyValueGrid } from "@/features/admin/components/admin-detail-shell";

export const metadata: Metadata = {
	title: "Admin document detail",
};

function formatDateTime(iso: string) {
	try {
		return new Date(iso).toLocaleString();
	} catch {
		return iso;
	}
}

function formatBytes(bytes: number) {
	if (!Number.isFinite(bytes)) return "—";
	const kb = 1024;
	const mb = kb * 1024;
	if (bytes >= mb) return `${(bytes / mb).toFixed(1)} MB`;
	if (bytes >= kb) return `${Math.round(bytes / kb)} KB`;
	return `${bytes} B`;
}

export default async function AdminDocumentDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const documentId = parseInt(id, 10);
	if (!Number.isFinite(documentId)) redirect("/admin/documents");

	const doc = await getAdminDocumentDetail(documentId);

	return (
		<AdminManagementShell
			crumbs={[
				{ label: "Admin", href: "/admin" },
				{ label: "Documents", href: "/admin/documents" },
				{ label: doc.fileName },
			]}
		>
			<AdminDetailShell>
				<AdminKeyValueGrid
					items={[
						{ label: "Document id", value: doc.id },
						{ label: "File name", value: doc.fileName },
						{ label: "Status", value: doc.status },
						{ label: "Visibility", value: doc.visibility },
						{ label: "Size", value: formatBytes(doc.fileSize) },
						{ label: "MIME type", value: doc.mimeType },
						{ label: "Created", value: formatDateTime(doc.createdAt) },
						{
							label: "Author",
							value: (
								<Link
									href={`/admin/users/${doc.author.id}`}
									className="text-emerald-200 hover:text-emerald-100"
								>
									{doc.author.email}
								</Link>
							),
						},
						{ label: "Chunks", value: doc.counts.chunks.toLocaleString() },
						{ label: "Saves", value: doc.counts.saves.toLocaleString() },
						{
							label: "File URL",
							value: (
								<a
									href={doc.fileUrl}
									target="_blank"
									rel="noreferrer"
									className="text-emerald-200 hover:text-emerald-100"
								>
									Open file
								</a>
							),
						},
					]}
				/>
			</AdminDetailShell>
		</AdminManagementShell>
	);
}

