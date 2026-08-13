import { REQUEST_NUMBER_PREFIX } from "../../domain/request/request.constants.js";

type RequestNumberCounterRecord = {
  nextValue: bigint;
};

type RequestNumberCounterDelegate = {
  update(args: {
    where: { id: string };
    data: { nextValue: { increment: bigint } };
    select: { nextValue: true };
  }): Promise<RequestNumberCounterRecord>;
};

export type RequestNumberRepositoryClient = {
  requestNumberCounter: RequestNumberCounterDelegate;
};

export const REQUEST_NUMBER_COUNTER_ID = "request";

export function formatRequestNumber(value: bigint): string {
  return `${REQUEST_NUMBER_PREFIX}-${value.toString()}`;
}

export async function generateNextRequestNumber(
  prisma: RequestNumberRepositoryClient,
): Promise<string> {
  const counter = await prisma.requestNumberCounter.update({
    where: { id: REQUEST_NUMBER_COUNTER_ID },
    data: {
      nextValue: {
        increment: 1n,
      },
    },
    select: {
      nextValue: true,
    },
  });

  return formatRequestNumber(counter.nextValue - 1n);
}
