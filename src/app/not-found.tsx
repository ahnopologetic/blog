import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground text-center">
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link 
        href="/" 
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Go back home
      </Link>
    </div>
  )
}
