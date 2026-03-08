"use client";

import { FileText, Bot, User } from "lucide-react";
import type { ChatMessage as ChatMessageType } from "../types";
import { cn } from "@/lib/utils";

interface ChatMessageListProps {
	messages: ChatMessageType[];
	isGenerating: boolean;
	onOpenCanvas: (messageId: string) => void;
}

export function ChatMessageList({
	messages,
	isGenerating,
	onOpenCanvas,
}: ChatMessageListProps) {
	return (
		<div className="max-w-2xl mx-auto space-y-6">
			{messages.map((msg) => (
				<div
					key={msg.id}
					className={cn(
						"flex gap-3",
						msg.role === "user" && "flex-row-reverse",
					)}
				>
					<div
						className={cn(
							"shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
							msg.role === "user" ? "bg-indigo-600" : "bg-gray-700",
						)}
					>
						{msg.role === "user" ? (
							<User className="w-4 h-4 text-white" />
						) : (
							<Bot className="w-4 h-4 text-gray-300" />
						)}
					</div>
					<div
						className={cn(
							"rounded-2xl px-4 py-3 max-w-[85%] flex flex-col gap-2",
							msg.role === "user"
								? "bg-indigo-600 text-white"
								: "bg-gray-800 text-gray-100 border border-gray-700",
						)}
					>
						{msg.role === "user" && msg.attachedDocument && (
							<div className="flex items-center gap-2 py-1.5 px-2 rounded-lg bg-white/10">
								<FileText className="w-4 h-4 shrink-0" />
								<span className="text-xs truncate">{msg.attachedDocument.fileName}</span>
							</div>
						)}
						<p className="text-sm whitespace-pre-wrap">{msg.content}</p>
						{msg.role === "assistant" &&
							msg.generatedCount != null &&
							msg.generatedCount > 0 && (
								<button
									type="button"
									onClick={() => onOpenCanvas(msg.id)}
									className="self-start mt-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
								>
									View {msg.generatedCount} question{msg.generatedCount !== 1 ? "s" : ""}
								</button>
							)}
					</div>
				</div>
			))}
			{isGenerating && (
				<div className="flex gap-3">
					<div className="shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
						<Bot className="w-4 h-4 text-gray-300" />
					</div>
					<div className="rounded-2xl px-4 py-3 bg-gray-800 border border-gray-700 flex items-center gap-2">
						<span className="flex gap-1">
							<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:0ms]" />
							<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:150ms]" />
							<span className="w-2 h-2 rounded-full bg-gray-500 animate-bounce [animation-delay:300ms]" />
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
