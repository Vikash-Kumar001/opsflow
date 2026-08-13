import { redirect } from "next/navigation";

export default function EmployeeIndexPage(): never {
  redirect("/employee/dashboard");
}
