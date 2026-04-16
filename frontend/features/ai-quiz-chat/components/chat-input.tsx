"use client";

import { X, FileText, Send, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatInputProps {
	input: string;
	onInputChange: (value: string) => void;
	onSend: () => void;
	selectedDoc: { fileName: string } | null;
	onRemoveDoc: () => void;
	onAttachClick: () => void;
	attachButtonRef: React.RefObject<HTMLButtonElement | null>;
	isGenerating: boolean;
}

export function ChatInput({
	input,
	onInputChange,
	onSend,
	selectedDoc,
	onRemoveDoc,
	onAttachClick,
	attachButtonRef,
	isGenerating,
}: ChatInputProps) {
	return (
		<div className="shrink-0 border-t border-(--app-border) bg-(--app-surface) px-4 py-4">
			<div className="max-w-2xl mx-auto">
				<div className="rounded-2xl border border-(--app-border) bg-(--app-surface-muted) focus-within:border-indigo-500 transition-colors overflow-hidden">
					{selectedDoc && (
						<div className="flex items-center gap-2 px-4 py-2 border-b border-(--app-border) bg-(--app-surface)">
							<FileText className="w-4 h-4 text-indigo-400 shrink-0" />
							<span className="text-sm text-(--app-fg) truncate flex-1 min-w-0">
								{selectedDoc.fileName}
							</span>
							<button
								type="button"
								onClick={onRemoveDoc}
								className="p-1 rounded-md text-(--app-fg-muted) hover:text-(--app-fg) hover:bg-(--app-surface-muted) transition-colors shrink-0"
								aria-label="Remove document"
							>
								<X className="w-4 h-4" />
							</button>
						</div>
					)}
					<div className="px-3 pt-3">
						<textarea
							value={input}
							onChange={(e) => onInputChange(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									onSend();
								}
							}}
							placeholder={
								selectedDoc
									? "Ask to generate questions..."
									: "Attach a document, then ask to generate questions..."
							}
							rows={1}
							className="w-full min-h-[44px] max-h-32 py-2.5 px-3 bg-transparent text-(--app-fg) placeholder:text-(--app-fg-muted)/60 resize-none focus:outline-none text-sm"
						/>
					</div>
					<div className="flex items-center justify-end gap-1 px-2 pb-2">
						<button
							ref={attachButtonRef}
							type="button"
							onClick={onAttachClick}
							className={cn(
								"shrink-0 p-2 rounded-lg transition-colors",
								selectedDoc
									? "text-indigo-400 bg-indigo-500/10"
									: "text-(--app-fg-muted) hover:text-indigo-400 hover:bg-(--app-surface)",
							)}
							aria-label="Attach document"
						>
							<Paperclip className="w-5 h-5" />
						</button>
						<button
							type="button"
							onClick={onSend}
							disabled={!input.trim() || isGenerating}
							className="shrink-0 p-2 rounded-lg text-indigo-400 hover:bg-indigo-500/20 disabled:opacity-40 disabled:pointer-events-none transition-colors"
							aria-label="Send"
						>
							<Send className="w-5 h-5" />
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
