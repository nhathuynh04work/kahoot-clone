"use client";

import { useIsMutating } from "@tanstack/react-query";
import Link from "next/link";
import { CloudCheck } from "lucide-react";
import { useState } from "react";
import { QuizFullDetails } from "@/lib/types/quiz";
import SettingsModal from "./settings-modal";

interface HeaderProps {
	quiz: QuizFullDetails;
}

export default function Header({ quiz }: HeaderProps) {
	const isMutatingCount = useIsMutating();
	const isPending = isMutatingCount > 0;

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [focusOn, setFocusOn] = useState<"title" | null>(null);

	function openTitleModal() {
		setFocusOn("title");
		setIsModalOpen(true);
	}

	function openSettingsModal() {
		setFocusOn(null);
		setIsModalOpen(true);
	}

	return (
		<>
			<div className="flex items-center px-4 py-2 border-b border-gray-700 bg-gray-800">
				<Link
					href="/dashboard"
					className="text-3xl mr-24 uppercase font-semibold">
					Kahoot!
				</Link>

				<div className="border border-gray-700 bg-gray-900 rounded-md pl-5 pr-2 py-2 flex items-center gap-10 hover:border-gray-500">
					<p
						onClick={openTitleModal}
						className={`${
							quiz.title ? "" : "text-gray-300"
						} font-semibold`}>
						{quiz.title ? quiz.title : "Enter quiz title..."}
					</p>
					<button
						onClick={openSettingsModal}
						className="bg-gray-300 text-black px-3 py-1 rounded-sm text-sm font-semibold cursor-pointer">
						Settings
					</button>
				</div>

				<div className="ml-auto flex items-center gap-4">
					<div className="text-sm text-gray-400 flex items-center gap-2">
						{isPending ? (
							<>
								<div className="w-4 h-4 border-2 border-dashed border-gray-400 rounded-full animate-spin"></div>
								<span>Saving...</span>
							</>
						) : (
							<CloudCheck className="mr-4" />
						)}
					</div>
					<Link
						href={"/dashboard"}
						className="font-semibold text-white bg-indigo-800 rounded-md px-8 py-3">
						Save
					</Link>
				</div>
			</div>

			{isModalOpen && (
				<SettingsModal
					quiz={quiz}
					focusOn={focusOn}
					onClose={() => setIsModalOpen(false)}
				/>
			)}
		</>
	);
}
