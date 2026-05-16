import { signIn } from "@/lib/auth"

export const metadata = { title: "Sign In — Knowledge Portal" }

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-8">
      <div className="text-center">
        <h1 className="font-serif text-[40px] leading-[1.2] tracking-[-0.02em]">
          Knowledge Portal
        </h1>
        <p className="mt-3 text-[16px] text-pale-stone">
          Sign in with your Botpress account to continue.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="rounded-button bg-off-black px-8 py-4 text-[15px] text-paper-canvas transition-opacity hover:opacity-80"
          >
            Sign in with Google
          </button>
        </form>

        <form
          action={async () => {
            "use server"
            await signIn("dev-bypass", { redirectTo: "/" })
          }}
        >
          <button
            type="submit"
            className="rounded-button border border-dashed border-pale-stone px-8 py-4 text-[15px] text-pale-stone transition-opacity hover:opacity-80"
          >
            Dev bypass
          </button>
        </form>
      </div>
    </div>
  )
}
