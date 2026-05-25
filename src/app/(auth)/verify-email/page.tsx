import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="bg-white shadow-md rounded-lg px-8 py-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
        <svg
          className="h-6 w-6 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
      <p className="text-gray-600 text-sm mb-6">
        We sent a confirmation link to your email address. Click the link to
        activate your account.
      </p>
      <p className="text-xs text-gray-400">
        Didn&apos;t receive it? Check your spam folder or{' '}
        <Link href="/signup" className="text-indigo-600 hover:text-indigo-500 font-medium">
          try signing up again
        </Link>
        .
      </p>
    </div>
  )
}
