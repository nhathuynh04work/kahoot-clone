"use client";

import dynamic from "next/dynamic";
import {
    X,
    Loader2,
    Play,
    Pencil,
    ChevronRight,
    Video,
    Users,
    Bookmark,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CSSProperties, ReactNode } from "react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AppLogo } from "@/components/layout/app-logo";
import { toggleQuizSave } from "@/features/quizzes/api/client-actions";
import { apiClient } from "@/lib/apiClient";
import { Select } from "@/components/ui/select";

const QuizDetailsDrawerPortal = dynamic(() => import("./quiz-details-drawer-portal"), {
    ssr: false,
});

function DrawerActions({
    quizId,
    isPending,
    onHostLive,
    isOwner,
    showSaveButton,
    saved,
    isSaving,
    onToggleSave,
    initialVisibility,
    className,
}: {
    quizId: number;
    isPending: boolean;
    onHostLive: () => void;
    isOwner: boolean;
    showSaveButton: boolean;
    saved: boolean;
    isSaving: boolean;
    onToggleSave: () => void;
    initialVisibility?: "PUBLIC" | "PRIVATE";
    className?: string;
}) {
    const queryClient = useQueryClient();
    const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">(
        initialVisibility ?? "PRIVATE",
    );

    const { mutate: updateVisibility, isPending: isUpdatingVisibility } =
        useMutation({
            mutationFn: async (next: "PUBLIC" | "PRIVATE") => {
                const { data } = await apiClient.patch(`/quiz/${quizId}`, {
                    visibility: next,
                });
                return data as { visibility?: "PUBLIC" | "PRIVATE" };
            },
            onSuccess: (res) => {
                if (res.visibility) setVisibility(res.visibility);
                void queryClient.invalidateQueries({ queryKey: ["mySavedQuizzes"] });
            },
        });

    return (
        <div className={className}>
            <div className="space-y-2">
                <button
                    type="button"
                    disabled={isPending}
                    onClick={onHostLive}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-(--app-surface)"
                >
                    <span className="flex items-center gap-2">
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Play className="w-4 h-4" />
                        )}
                        Host game
                    </span>
                    <ChevronRight className="w-4 h-4 text-indigo-200" />
                </button>

                {isOwner && (
                    <Link
                        href={`/quiz/${quizId}/edit`}
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-(--app-surface) hover:bg-(--app-surface-muted) text-(--app-fg) text-sm font-medium transition-colors border border-(--app-border)"
                    >
                        <span className="flex items-center gap-2">
                            <Pencil className="w-4 h-4" />
                            Edit
                        </span>
                        <ChevronRight className="w-4 h-4 text-(--app-fg-muted)" />
                    </Link>
                )}

                {showSaveButton && (
                    <button
                        type="button"
                        onClick={onToggleSave}
                        disabled={isSaving}
                        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors border ${saved
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500/30"
                                : "bg-(--app-surface) hover:bg-(--app-surface-muted) text-(--app-fg) border-(--app-border)"
                            } ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
                        aria-label={saved ? "Unsave quiz" : "Save quiz"}
                    >
                        <span className="flex items-center gap-2">
                            <Bookmark
                                className="w-4 h-4"
                                fill={saved ? "currentColor" : "none"}
                            />
                            {isSaving ? "Saving…" : saved ? "Saved" : "Save"}
                        </span>
                        <ChevronRight className="w-4 h-4 text-(--app-fg-muted)" />
                    </button>
                )}

                {isOwner && (
                    <div className="pt-3">
                        <p className="text-xs font-medium text-(--app-fg-muted) mb-2">Visibility</p>
                        <Select
                            value={visibility}
                            onValueChange={(v) => {
                                if (isUpdatingVisibility) return;
                                const next = v as "PUBLIC" | "PRIVATE";
                                setVisibility(next);
                                updateVisibility(next);
                            }}
                            options={[
                                { value: "PRIVATE", label: "Private" },
                                { value: "PUBLIC", label: "Public" },
                            ]}
                            ariaLabel="Quiz visibility"
                            placeholder="Select visibility"
                            buttonClassName={
                                isUpdatingVisibility ? "opacity-60 pointer-events-none" : undefined
                            }
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function DrawerHeader({
    authorName,
    onClose,
}: {
    authorName: string;
    onClose: () => void;
}) {
    return (
        <header className="flex items-center gap-3 px-4 py-3 border-b border-(--app-border) shrink-0">
            <div className="flex items-center gap-3 min-w-0 justify-self-start">
                <UserAvatar name={authorName} size={32} />
                <span className="text-sm text-(--app-fg-muted) truncate">{authorName}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-lg text-(--app-fg-muted) hover:bg-(--app-surface-muted) hover:text-(--app-fg) transition-colors shrink-0"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}

function DrawerHero({
    coverUrl,
    title,
    playsLabel,
    participantsLabel,
}: {
    coverUrl?: string;
    title: string;
    playsLabel: string;
    participantsLabel: string;
}) {
    return (
        <div className="shrink-0 p-4 pb-0">
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative w-full sm:w-48 h-36 sm:h-28 rounded-xl overflow-hidden bg-(--app-surface-muted) shrink-0">
                    {coverUrl ? (
                        <Image
                            src={coverUrl}
                            alt={title || "Quiz cover"}
                            fill
                            className="object-cover"
                            sizes="192px"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-indigo-500/18 via-(--app-fg)/6 to-emerald-500/14">
                            <AppLogo variant="mark" className="text-4xl font-black tracking-tight" />
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl font-bold text-(--app-fg) sm:truncate">{title}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-(--app-fg-muted)">
                        <span className="flex items-center gap-1.5">
                            <Video className="w-4 h-4" />
                            {playsLabel}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {participantsLabel}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type QuizDetailsDrawerShellProps = {
    authorName: string;
    onClose: () => void;
    coverUrl?: string;
    title: string;
    playsLabel: string;
    participantsLabel: string;
    quizId: number;
    isHostPending?: boolean;
    onHostLive?: () => void;
    showSaveButton?: boolean;
    initialIsSaved?: boolean;
    isOwner?: boolean;
    initialVisibility?: "PUBLIC" | "PRIVATE";
    backdropStyle: CSSProperties;
    panelStyle: CSSProperties;
    onBackdropClick: () => void;
    content: ReactNode;
    hideSidebar?: boolean;
    portal?: boolean;
};

export function QuizDetailsDrawerShell({
    authorName,
    onClose,
    coverUrl,
    title,
    playsLabel,
    participantsLabel,
    quizId,
    isHostPending,
    onHostLive,
    showSaveButton,
    initialIsSaved,
    isOwner,
    initialVisibility,
    backdropStyle,
    panelStyle,
    onBackdropClick,
    content,
    hideSidebar = false,
    portal = false,
}: QuizDetailsDrawerShellProps) {
    const queryClient = useQueryClient();
    const [savedOverride, setSavedOverride] = useState<boolean | null>(null);
    const saved = savedOverride ?? !!initialIsSaved;

    const { mutate: toggleSave, isPending: isSaving } = useMutation({
        mutationFn: () => toggleQuizSave(quizId),
        onSuccess: (res) => {
            setSavedOverride(res.saved);
            void queryClient.invalidateQueries({ queryKey: ["mySavedQuizzes"] });
        },
    });

    const shell = (
        <div
            className="fixed inset-0 z-50 touch-none bg-black/40 backdrop-blur-[1px] transition-opacity ease-out"
            style={backdropStyle}
            onClick={onBackdropClick}
            aria-modal
            role="dialog"
        >
            <div className="relative h-full w-full">
                <div
                    className="absolute inset-0 sm:inset-auto sm:bottom-0 sm:left-0 sm:right-0 mx-auto w-full max-w-full overflow-hidden rounded-none sm:rounded-t-2xl bg-(--app-surface) border border-(--app-border) border-b-0 shadow-2xl flex flex-col transition-transform ease-out"
                    style={panelStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    <DrawerHeader authorName={authorName} onClose={onClose} />

                    <div className="flex-1 min-h-0 flex">
                        {/* Mobile: single scroll container from hero -> bottom */}
                        <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden bg-(--app-surface)">
                            <div className="sm:hidden">
                                <DrawerHero
                                    coverUrl={coverUrl}
                                    title={title}
                                    playsLabel={playsLabel}
                                    participantsLabel={participantsLabel}
                                />

                                {!hideSidebar && onHostLive && typeof isHostPending === "boolean" ? (
                                    <DrawerActions
                                        quizId={quizId}
                                        isPending={isHostPending}
                                        onHostLive={onHostLive}
                                        isOwner={!!isOwner}
                                        showSaveButton={!!showSaveButton}
                                        saved={saved}
                                        isSaving={isSaving}
                                        onToggleSave={() => toggleSave()}
                                        initialVisibility={initialVisibility}
                                        className="px-4 pt-4"
                                    />
                                ) : null}
                            </div>

                            <div className="px-4 pb-6 pt-4 sm:hidden">{content}</div>

                            {/* Desktop/tablet: keep existing non-scrolling hero + inner scroll body */}
                            <div className="hidden sm:flex h-full min-h-0">
                                <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                                    <DrawerHero
                                        coverUrl={coverUrl}
                                        title={title}
                                        playsLabel={playsLabel}
                                        participantsLabel={participantsLabel}
                                    />
                                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-0">
                                        {content}
                                    </div>
                                </div>

                                {!hideSidebar && onHostLive && typeof isHostPending === "boolean" ? (
                                    <DrawerActions
                                        quizId={quizId}
                                        isPending={isHostPending}
                                        onHostLive={onHostLive}
                                        isOwner={!!isOwner}
                                        showSaveButton={!!showSaveButton}
                                        saved={saved}
                                        isSaving={isSaving}
                                        onToggleSave={() => toggleSave()}
                                        initialVisibility={initialVisibility}
                                        className="w-[260px] shrink-0 border-l border-(--app-border) bg-(--app-surface-muted) p-4"
                                    />
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (!portal) return shell;
    return <QuizDetailsDrawerPortal key={quizId}>{shell}</QuizDetailsDrawerPortal>;
}

