import { SubmitForm } from "@/components/SubmitForm"

export const metadata = { title: "Submit — Knowledge Portal" }

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-10">
      <h1 className="font-serif text-[40px] leading-[1.2] tracking-[-0.02em]">
        Share a resource
      </h1>
      <SubmitForm />
    </div>
  )
}
