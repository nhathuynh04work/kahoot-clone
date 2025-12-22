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

interface SettingsModalProps {
	onClose: () => void;
}

type SettingsFormValues = Pick<
	QuizFullDetails,
	"title" | "description" | "coverUrl"
>;

export default function SettingsModal({ onClose }: SettingsModalProps) {
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
		},
	});

	const coverUrl = watch("coverUrl");

	const onSave = (data: SettingsFormValues) => {
		setParentValue("title", data.title, { shouldDirty: true });
		setParentValue("description", data.description, { shouldDirty: true });
		setParentValue("coverUrl", data.coverUrl, { shouldDirty: true });
		onClose();
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
			onClick={onClose}>
			<form
				onSubmit={handleSubmit(onSave)}
				className="relative w-full max-w-lg rounded-lg bg-gray-800 border border-gray-700 shadow-2xl"
				onClick={(e) => e.stopPropagation()}>
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<h3 className="text-xl font-semibold text-white">
						Quiz Settings
					</h3>
					<button
						type="button"
						onClick={onClose}
						className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
						<X className="w-5 h-5" />
					</button>
				</div>

				<div className="p-6 space-y-5">
					{/* Title Input */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Title
						</label>
						<input
							{...register("title")}
							className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white text-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
							placeholder="Enter quiz title..."
						/>
					</div>

					{/* Description Input */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
							Description
						</label>
						<textarea
							{...register("description")}
							rows={3}
							className="w-full p-3 bg-gray-900 border border-gray-700 rounded-md text-white resize-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
							placeholder="Enter a description..."
						/>
					</div>

					{/* Cover Image Uploader */}
					<div>
						<label className="block text-sm font-medium text-gray-300 mb-2">
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
												? "cursor-pointer hover:border-gray-500 hover:bg-gray-800/50"
												: ""
										}
                                        ${
											error
												? "border-red-500 bg-red-900/10"
												: "border-gray-700 bg-gray-900"
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
													className="px-3 py-1.5 bg-gray-200 text-gray-900 text-xs font-semibold rounded hover:bg-white transition-colors">
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
										<div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
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
														className="text-xs text-white bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">
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
													<div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-md text-xs border border-gray-700 group-hover:border-gray-500 group-hover:text-white transition-colors">
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
				</div>

				<div className="flex justify-end items-center gap-3 p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg">
					<button
						type="button"
						onClick={onClose}
						className="font-semibold text-gray-300 py-2 px-6 rounded-md hover:bg-gray-700 hover:text-white transition-colors">
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
