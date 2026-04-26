/** @type {import('next').NextConfig} */
const nextConfig = {
	async redirects() {
		return [
			{
				source: '/short',
				destination: '/focused',
				permanent: true,
			},
			{
				source: '/detailed',
				destination: '/in-depth',
				permanent: true,
			},
		]
	},
}

module.exports = nextConfig