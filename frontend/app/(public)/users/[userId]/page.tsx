import type { Metadata } from "next";
import { apiServer } from "@/lib/apiServer";
import { getCurrentUser } from "@/features/auth/api/server-actions";
import { SITE_NAME } from "@/lib/site";
import { UserAvatar } from "@/components/ui/user-avatar";
import { QuizCard } from "@/features/quizzes/components/quiz-card";
import type { QuizWithQuestions } from "@/features/quizzes/types";
import { DocumentCard } from "@/features/documents/components/document-card";
import type { Document } from "@/features/documents/types";
import { ProfileEditOwnerActions } from "@/features/profile/components/profile-edit-owner-actions";
import { LandingTopBar } from "@/components/layout/landing-top-bar";
import TopBar from "@/components/layout/top-bar";
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar";
import { redirect } from "next/navigation";

interface ProfilePageProps {
	params: Promise<{ userId: string }>;
}

export async function generateMetadata({
	params,
}: ProfilePageProps): Promise<Metadata> {
	const userId = parseInt((await params).userId, 10);
	if (!Number.isFinite(userId)) {
		return { title: "Profile" };
	}
	try {
		const api = await apiServer();
		const { data: profile } = await api.get<{
			name?: string | null;
			email?: string | null;
		}>(`/users/${userId}`);
		const label =
			(profile?.name && String(profile.name).trim()) ||
			(profile?.email && String(profile.email).trim()) ||
			"User";
		return {
			title: label,
			description: `Quizzes and documents by ${label} on ${SITE_NAME}.`,
		};
	} catch {
		return { title: "Profile" };
	}
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
	const userId = parseInt((await params).userId, 10);
	const viewer = await getCurrentUser();
	const isOwner = !!viewer && viewer.id === userId;
	if (viewer?.role === "ADMIN") redirect("/admin");

	const api = await apiServer();
	const { data: profile } = await api.get(`/users/${userId}`);

	const [, mySavedDocumentIds] = viewer
		? await Promise.all([
				api.get<{ ids: number[] }>("/saves/QUIZ").then((r) => r.data.ids),
				api
					.get<{ ids: number[] }>("/saves/DOCUMENT")
					.then((r) => r.data.ids),
			])
		: [[], []];

	const quizMode = "recent";
	const quizPageSize = 24;

	const quizzesResponse = isOwner
		? await api.get("/quiz")
		: await api.get(
				`/public/users/${userId}/quizzes?mode=${quizMode}&page=1&pageSize=${quizPageSize}`,
			);

	const quizzes: Array<QuizWithQuestions & { saveCount?: number; playCount?: number }> =
		isOwner ? (quizzesResponse.data as any) : (quizzesResponse.data.items as any);

	const docPageSize = 24;
	const documentsResponse = isOwner
		? await api.get("/documents")
		: await api.get(
				`/public/users/${userId}/documents?mode=recent&page=1&pageSize=${docPageSize}`,
			);

	const documents: Document[] = isOwner
		? (documentsResponse.data as any)
		: (documentsResponse.data.items as any);

	const content = (
		<div className="p-4 md:p-8">
			<div className="max-w-6xl mx-auto space-y-8">
				<header className="flex items-start justify-between gap-6">
					<div className="flex items-center gap-4 min-w-0">
						<UserAvatar
							name={profile.name ?? profile.email ?? ""}
							size={52}
							className="shrink-0"
						/>
						<div className="min-w-0">
							<h1 className="text-2xl font-bold truncate">
								{profile.name ?? profile.email ?? "Unknown user"}
							</h1>
							<p className="text-sm text-(--app-fg-muted) mt-1">
								{isOwner ? "This is your profile." : "Public profile"}
							</p>
						</div>
					</div>

					{isOwner && viewer && (
						<ProfileEditOwnerActions
							userId={viewer.id}
							initialName={viewer.name ?? ""}
							initialAvatarUrl={viewer.avatarUrl ?? null}
						/>
					)}
				</header>

				<section className="space-y-3">
					<div className="flex items-baseline justify-between gap-4">
						<h2 className="text-lg font-semibold">Quizzes</h2>
						<p className="text-sm text-(--app-fg-muted)">
							{quizzes.length} {quizzes.length === 1 ? "quiz" : "quizzes"}
						</p>
					</div>

					{quizzes.length === 0 ? (
						<div className="p-6 rounded-lg bg-(--app-surface-muted) border border-(--app-border) text-center text-(--app-fg-muted)">
							No quizzes to show.
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							{quizzes.map((quiz) => (
								<QuizCard
									key={quiz.id}
									quiz={quiz}
									viewerId={viewer?.id}
								/>
							))}
						</div>
					)}
				</section>

				<section className="space-y-3">
					<div className="flex items-baseline justify-between gap-4">
						<h2 className="text-lg font-semibold">Documents</h2>
						<p className="text-sm text-(--app-fg-muted)">
							{documents.length}{" "}
							{documents.length === 1 ? "document" : "documents"}
						</p>
					</div>

					{documents.length === 0 ? (
						<div className="p-6 rounded-lg bg-(--app-surface-muted) border border-(--app-border) text-center text-(--app-fg-muted)">
							No documents to show.
						</div>
					) : (
						<div className="space-y-3">
							{documents.map((doc) => (
								<DocumentCard
									key={doc.id}
									document={doc}
									showDelete={isOwner}
									showVisibilityToggle={isOwner}
									showSave={!isOwner}
									isSaved={mySavedDocumentIds.includes(doc.id)}
									viewerId={viewer?.id}
								/>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	);

	if (viewer) {
		return (
			<div
				className="h-dvh overflow-hidden bg-(--app-bg) text-(--app-fg) flex flex-col"
				style={{ ["--app-header-height" as string]: "58px" }}
			>
				<TopBar user={viewer} />
				<div className="flex flex-1 min-h-0">
					<DashboardSidebar user={viewer} />
					<main className="flex-1 min-w-0 overflow-y-auto">{content}</main>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-dvh bg-(--app-bg) text-(--app-fg) flex flex-col">
			<LandingTopBar />
			<main className="flex-1">{content}</main>
		</div>
	);
}

