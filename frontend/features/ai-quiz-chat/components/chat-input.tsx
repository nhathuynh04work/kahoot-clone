"use client";

import { X, FileText, Send, Paperclip } from "lucide-react";
import type { MockDocument } from "../types";
import { cn } from "@/lib/utils";

interface ChatInputProps {
	input: string;
	onInputChange: (value: string) => void;
	onSend: () => void;
	selectedDoc: MockDocument | null;
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
		<div className="shrink-0 border-t border-gray-800 bg-gray-900/50 px-4 py-4">
			<div className="max-w-2xl mx-auto">
				<div className="rounded-2xl border border-gray-700 bg-gray-800/80 focus-within:border-indigo-500/50 transition-colors overflow-hidden">
					{selectedDoc && (
						<div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700/80 bg-gray-800/50">
							<FileText className="w-4 h-4 text-indigo-400 shrink-0" />
							<span className="text-sm text-gray-200 truncate flex-1 min-w-0">
								{selectedDoc.fileName}
							</span>
							<button
								type="button"
								onClick={onRemoveDoc}
								className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors shrink-0"
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
							className="w-full min-h-[44px] max-h-32 py-2.5 px-3 bg-transparent text-white placeholder:text-gray-500 resize-none focus:outline-none text-sm"
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
									: "text-gray-400 hover:text-indigo-400 hover:bg-gray-700/50",
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
				<p className="text-xs text-gray-500 mt-2 text-center">
					Mock UI — use &quot;Generate 5 questions&quot; to see the canvas.
				</p>
			</div>
		</div>
	);
}
