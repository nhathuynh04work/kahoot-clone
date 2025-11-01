import { getCurrentUser } from "./actions/get-current-user";

export default async function Home() {
	const user = await getCurrentUser();

	return (
		<div className="flex flex-col items-center justify-center min-h-screen">
			<h1 className="text-2xl">Welcome back, {user.email}!</h1>
		</div>
	);
}
