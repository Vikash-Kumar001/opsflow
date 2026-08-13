import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  DataTable,
  EmptyState,
  Pagination,
  SearchInput,
  UserSummary,
  type DataTableColumn,
} from "@/components/shared";
import {
  RequestCategoryBadge,
  RequestMetadataList,
  RequestPriorityBadge,
  RequestStatusBadge,
  RequestTimeline,
} from "@/features/shared/requests";

type TestRow = {
  id: string;
  name: string;
};

const columns: Array<DataTableColumn<TestRow>> = [
  {
    id: "name",
    header: "Name",
    cell: (row) => row.name,
  },
];

describe("shared design system components", () => {
  it("renders accessible search input and clear control", async () => {
    const onChange = vi.fn<(value: string) => void>();

    render(
      <SearchInput
        value="travel"
        onChange={onChange}
        label="Search requests"
      />,
    );

    expect(screen.getByLabelText("Search requests")).toHaveValue("travel");

    fireEvent.click(screen.getByRole("button", { name: "Clear search" }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("renders table data and empty states", () => {
    const { rerender } = render(
      <DataTable
        aria-label="Requests"
        columns={columns}
        data={[{ id: "row-1", name: "Laptop request" }]}
        getRowKey={(row) => row.id}
      />,
    );

    expect(screen.getByRole("table", { name: "Requests" })).toBeInTheDocument();
    expect(screen.getByText("Laptop request")).toBeInTheDocument();

    rerender(
      <DataTable
        aria-label="Requests"
        columns={columns}
        data={[]}
        getRowKey={(row) => row.id}
        emptyState={<EmptyState title="No requests" />}
      />,
    );

    expect(screen.getByText("No requests")).toBeInTheDocument();
    expect(screen.queryByRole("table", { name: "Requests" })).not.toBeInTheDocument();
  });

  it("renders pagination controls with disabled boundaries", async () => {
    const onPageChange = vi.fn<(page: number) => void>();

    render(
      <Pagination
        page={2}
        limit={10}
        total={25}
        onPageChange={onPageChange}
      />,
    );

    expect(screen.getByText("Showing 11-20 of 25")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /previous/i }));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });

  it("renders user summaries without exposing role-specific behavior", () => {
    render(
      <UserSummary
        user={{
          name: "Demo Employee",
          email: "employee@opsflow.demo",
          role: "EMPLOYEE",
        }}
      />,
    );

    expect(screen.getByText("Demo Employee")).toBeInTheDocument();
    expect(screen.getByText("employee@opsflow.demo")).toBeInTheDocument();
    expect(screen.getByText("DE")).toBeInTheDocument();
  });

  it("renders request badges, metadata, and timeline labels", () => {
    render(
      <div>
        <RequestStatusBadge value="IN_REVIEW" />
        <RequestPriorityBadge value="URGENT" />
        <RequestCategoryBadge value="SOFTWARE_ACCESS" />
        <RequestMetadataList
          items={[
            { label: "Request number", value: "REQ-1001" },
            { label: "Empty", value: "" },
          ]}
        />
        <RequestTimeline
          events={[
            {
              id: "event-1",
              label: "Submitted",
              timestamp: "2026-08-13T09:00:00.000Z",
              description: "Employee submitted the request.",
            },
          ]}
        />
      </div>,
    );

    expect(screen.getByText("In review")).toBeInTheDocument();
    expect(screen.getByText("Urgent")).toBeInTheDocument();
    expect(screen.getByText("Software access")).toBeInTheDocument();
    expect(screen.getByText("REQ-1001")).toBeInTheDocument();
    expect(screen.queryByText("Empty")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Request timeline")).toBeInTheDocument();
    expect(screen.getByText("Submitted")).toBeInTheDocument();
  });
});
