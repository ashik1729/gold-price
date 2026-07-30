import PriceScreen from "@/components/PriceScreen";
import { GOLDAPI_ENABLED } from "@/lib/constants";
import { fetchMetals } from "@/lib/fetchMetals";
import type { MetalsApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let initialData: MetalsApiResponse | null = null;
  let initialError: string | null = null;

  if (GOLDAPI_ENABLED) {
    try {
      initialData = await fetchMetals();
    } catch (error) {
      initialError =
        error instanceof Error ? error.message : "Unable to fetch metal prices";
    }
  }

  return (
    <PriceScreen
      initialData={initialData}
      initialError={initialError}
      apiEnabled={GOLDAPI_ENABLED}
    />
  );
}
