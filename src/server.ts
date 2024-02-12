Bun.serve({
	port: 3000,
	fetch(req) {
		const url = new URL(req.url)
		if (url.pathname === '/') {
			const data = JSON.stringify({ message: 'Hello, home page!' })
			return new Response(data, {
				status: 200,
				headers: { 'Content-Type': 'application/json' },
			})
		}
		if (url.pathname === '/blog') return new Response('Blog!')
		return new Response('404!')
	},
})
