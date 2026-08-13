import { redirect } from "next/navigation";

export default function ManagerIndexPage(): never {
  redirect("/manager/dashboard");
}
