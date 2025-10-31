export default async function Home() {
	const data = await fetch("http://localhost:3000");
	console.log(data);

	return;
}
