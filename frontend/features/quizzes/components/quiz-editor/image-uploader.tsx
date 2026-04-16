"use client";

import { useFormContext } from "react-hook-form";
import {
	Image as LucideImage,
	Trash2,
	Loader2,
	UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { QuizFullDetails } from "@/features/quizzes/types";
import { Uploader } from "@/features/img-upload/components/uploader";

export function ImageUploader({
	questionIndex,
}: {
	questionIndex: number;
}) {
	const { watch, setValue } = useFormContext<QuizFullDetails>();
	const imageUrl = watch(`questions.${questionIndex}.imageUrl`);

	return (
		<Uploader
			onUploadSuccess={(url) => {
				setValue(`questions.${questionIndex}.imageUrl`, url, {
					shouldDirty: true,
					shouldValidate: true,
				});
			}}>
			{({ triggerUpload, isUploading, error }) => (
				<div
					onClick={!imageUrl ? triggerUpload : undefined}
					className={`
                        w-full max-w-md h-64 shrink-0 rounded-md border-2 border-dashed 
                        flex flex-col items-center justify-center overflow-hidden relative group transition-colors
                        ${
							!imageUrl
								? "cursor-pointer hover:bg-(--app-surface-muted) hover:border-indigo-500/40"
								: ""
						}
                        ${
							error
								? "border-red-500 bg-red-900/10"
								: "bg-(--app-bg) border-(--app-border) text-(--app-fg-muted)/70"
						}
                    `}>
					{/* A. LOADING STATE OVERLAY */}
					{isUploading && (
						<div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center text-white">
							<Loader2 className="w-10 h-10 animate-spin mb-2 text-indigo-500" />
							<p className="text-sm font-medium">Uploading...</p>
						</div>
					)}

					{/* B. IMAGE PREVIEW MODE */}
					{imageUrl ? (
						<>
							<Image
								src={imageUrl}
								alt="Question visual"
								fill
								className="object-contain"
							/>

							{/* Remove Overlay */}
							<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										setValue(
											`questions.${questionIndex}.imageUrl`,
											"",
											{ shouldDirty: true }
										);
									}}
									className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-red-700 shadow-lg transform transition-transform hover:scale-105">
									<Trash2 className="w-4 h-4" /> Remove
								</button>
							</div>
						</>
					) : (
						/* C. EMPTY STATE (UPLOAD PROMPT) */
						<div className="flex flex-col items-center p-6 text-center">
							{error ? (
								<>
									<p className="text-red-400 font-semibold mb-1">
										Upload Failed
									</p>
									<p className="text-xs text-red-400 opacity-80 mb-4 px-4">
										{error}
									</p>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											triggerUpload();
										}}
										className="text-xs bg-(--app-surface) border border-(--app-border) px-3 py-1 rounded hover:bg-(--app-surface-muted) text-(--app-fg)">
										Try Again
									</button>
								</>
							) : (
								<>
									<LucideImage
										className="w-16 h-16 mb-4 opacity-50 group-hover:scale-110 transition-transform duration-300"
										strokeWidth={1}
									/>
									<p className="font-semibold mb-1 text-(--app-fg-muted)">
										Add Image
									</p>

									<div className="px-4 py-2 bg-(--app-surface) rounded-full text-xs font-medium text-(--app-fg-muted) border border-(--app-border) group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center gap-2">
										<UploadCloud className="w-4 h-4" />
										Upload File
									</div>
								</>
							)}
						</div>
					)}
				</div>
			)}
		</Uploader>
	);
}
