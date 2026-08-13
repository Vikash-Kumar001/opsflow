import { PageHeader } from "@/components/shared";
import { CreateRequestForm } from "@/features/employee/requests";

export default function NewEmployeeRequestPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employee requests"
        title="Create request"
        description="Start a new request with the details needed for review."
      />
      <CreateRequestForm />
    </div>
  );
}
