export function GET() {
	return new Response(JSON.stringify({}), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
} 