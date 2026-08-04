import PriceBoardStatic from "@/components/PriceBoardStatic";
import PriceScreen from "@/components/PriceScreen";
import { fetchMetals } from "@/lib/fetchMetals";
import type { MetalsApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let initialData: MetalsApiResponse | null = null;
  let initialError: string | null = null;

  try {
    initialData = await fetchMetals();
  } catch (error) {
    initialError =
      error instanceof Error ? error.message : "Unable to fetch metal prices";
  }

  const generatedAt = new Date();

  return (
    <>
      {/*
        Static board first in the document — old TVs that fail CSS/JS still get
        readable markup. Live board only mounts when JS works and covers it.
      */}
      <PriceBoardStatic
        data={initialData}
        error={initialError}
        generatedAt={generatedAt}
      />
      <PriceScreen
        initialData={initialData}
        initialError={initialError}
        apiEnabled
      />
    </>
  );
}
