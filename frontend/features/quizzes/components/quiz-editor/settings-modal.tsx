"use client";

import { useForm, useFormContext } from "react-hook-form";
import {
	X,
	Image as LucideImage,
	UploadCloud,
	Loader2,
	Trash2,
} from "lucide-react";
import Image from "next/image";
import { QuizFullDetails } from "@/features/quizzes/types";
import { Uploader } from "@/features/img-upload/components/uploader";
import { useState } from "react";
import { Select } from "@/components/ui/select";

interface SettingsModalProps {
	onClose: () => void;
}

type SettingsFormValues = Pick<
	QuizFullDetails,
	"title" | "description" | "coverUrl" | "visibility"
>;

export function SettingsModal({ onClose }: SettingsModalProps) {
	const [isUploading, setIsUploading] = useState(false);
	const { getValues, setValue: setParentValue } =
		useFormContext<QuizFullDetails>();

	const {
		register,
		handleSubmit,
		watch,
		setValue: setLocalValue,
	} = useForm<SettingsFormValues>({
		defaultValues: {
			title: getValues("title"),
			description: getValues("description"),
			coverUrl: getValues("coverUrl"),
			visibility: getValues("visibility") ?? "PRIVATE",
		},
	});

	const coverUrl = watch("coverUrl");
	const visibility = watch("visibility") ?? "PRIVATE";

	const onSave = (data: SettingsFormValues) => {
		setParentValue("title", data.title, { shouldDirty: true });
		setParentValue("description", data.description, { shouldDirty: true });
		setParentValue("coverUrl", data.coverUrl, { shouldDirty: true });
		setParentValue("visibility", data.visibility, { shouldDirty: true });
		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}>
			<form
				onSubmit={handleSubmit(onSave)}
				className="relative w-full max-w-lg max-h-[80vh] rounded-lg bg-(--app-surface) border border-(--app-border) shadow-2xl flex flex-col text-(--app-fg)"
				onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-(--app-border)">
					<h3 className="text-xl font-semibold text-(--app-fg)">
						Quiz Settings
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full text-(--app-fg-muted) hover:bg-(--app-surface-muted) hover:text-(--app-fg) transition-colors">
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5">
					{/* Title Input */}
					<div>
						<label className="block text-sm font-medium text-(--app-fg-muted) mb-2">
							Title
						</label>
						<input
							{...register("title")}
							className="w-full p-3 bg-(--app-bg) border border-(--app-border) rounded-md text-(--app-fg) text-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
							placeholder="Enter quiz title..."
						/>
					</div>

					{/* Description Input */}
					<div>
						<label className="block text-sm font-medium text-(--app-fg-muted) mb-2">
							Description
						</label>
						<textarea
							{...register("description")}
							rows={3}
							className="w-full p-3 bg-(--app-bg) border border-(--app-border) rounded-md text-(--app-fg) resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
							placeholder="Enter a description..."
						/>
					</div>

					{/* Cover Image Uploader */}
					<div>
						<label className="block text-sm font-medium text-(--app-fg-muted) mb-2">
							Cover Image
						</label>

						<Uploader
							onUploadStart={() => setIsUploading(true)}
							onUploadSuccess={(url) => {
								setLocalValue("coverUrl", url, {
									shouldDirty: true,
								});
								setIsUploading(false);
							}}
							onUploadError={() => setIsUploading(false)}>
							{({ isUploading, error, triggerUpload }) => (
								<div
									onClick={
										!coverUrl ? triggerUpload : undefined
									}
									className={`
                                        relative w-full aspect-video rounded-md border-2 border-dashed overflow-hidden group transition-all
                                        ${
											!coverUrl
												? "cursor-pointer hover:border-indigo-500/40 hover:bg-(--app-surface-muted)"
												: ""
										}
                                        ${
											error
												? "border-red-500 bg-red-900/10"
												: "border-(--app-border) bg-(--app-bg)"
										}
                                    `}>
									{/* 1. Loading State */}
									{isUploading && (
										<div className="absolute inset-0 z-20 bg-black/70 flex flex-col items-center justify-center text-white backdrop-blur-sm">
											<Loader2 className="w-8 h-8 animate-spin mb-2 text-indigo-500" />
											<p className="text-sm font-medium">
												Uploading cover...
											</p>
										</div>
									)}

									{/* 2. Image Preview State */}
									{coverUrl ? (
										<>
											<Image
												src={coverUrl}
												alt="Quiz cover"
												fill
												className="object-cover"
											/>
											{/* Hover Actions */}
											<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity z-10">
												<button
													type="button"
													onClick={triggerUpload}
													className="px-3 py-1.5 bg-(--app-surface) text-(--app-fg) text-xs font-semibold rounded border border-(--app-border) hover:bg-(--app-surface-muted) transition-colors">
													Change
												</button>
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														setLocalValue(
															"coverUrl",
															"",
															{
																shouldDirty:
																	true,
															}
														);
													}}
													className="p-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</>
									) : (
										/* 3. Empty State */
										<div className="flex flex-col items-center justify-center h-full text-(--app-fg-muted)/70 p-4">
											{error ? (
												<div className="text-center">
													<p className="text-red-400 font-medium text-sm mb-1">
														Upload Failed
													</p>
													<p className="text-xs text-red-400/70 mb-3">
														{error}
													</p>
													<button
														type="button"
														onClick={(e) => {
															e.stopPropagation();
															triggerUpload();
														}}
														className="text-xs text-(--app-fg) bg-(--app-surface-muted) px-3 py-1 rounded border border-(--app-border) hover:bg-(--app-surface)">
														Retry
													</button>
												</div>
											) : (
												<>
													<LucideImage className="w-10 h-10 mb-3 opacity-40" />
													<p className="text-sm font-medium mb-1">
														Add Cover Image
													</p>
													<p className="text-xs opacity-60 mb-3">
														16:9 ratio recommended
													</p>
													<div className="flex items-center gap-2 px-3 py-1.5 bg-(--app-surface) rounded-md text-xs border border-(--app-border) group-hover:border-indigo-500/40 group-hover:text-(--app-fg) transition-colors">
														<UploadCloud className="w-3 h-3" />
														<span>Select File</span>
													</div>
												</>
											)}
										</div>
									)}
								</div>
							)}
						</Uploader>
					</div>

					{/* Visibility */}
					<div>
						<label className="block text-sm font-medium text-(--app-fg-muted) mb-2">
							Visibility
						</label>
						<Select
							value={visibility}
							onValueChange={(v) => {
								setLocalValue("visibility", v as "PUBLIC" | "PRIVATE", {
									shouldDirty: true,
								});
							}}
							options={[
								{ value: "PRIVATE", label: "Private" },
								{ value: "PUBLIC", label: "Public" },
							]}
							ariaLabel="Quiz visibility"
							placeholder="Select visibility"
						/>
					</div>
				</div>

				<div className="flex justify-end items-center gap-3 p-4 bg-(--app-surface) border-t border-(--app-border) rounded-b-lg">
					<button
						type="button"
						onClick={onClose}
						className="font-semibold text-(--app-fg-muted) py-2 px-6 rounded-md hover:bg-(--app-surface-muted) hover:text-(--app-fg) transition-colors">
						Cancel
					</button>
					<button
						type="submit"
						disabled={isUploading}
						className="font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md px-6 py-2 transition-colors shadow-lg shadow-indigo-900/20">
						{isUploading ? "Uploading..." : "Done"}
					</button>
				</div>
			</form>
		</div>
	);
}
