import { BudgetMeter } from "@/components/sponsorship/BudgetMeter";
import { stroopsToXlm } from "@/lib/sponsorship";
import type { SponsorshipConfig } from "@/lib/sponsorship";

interface SponsorshipSummaryProps {
  config: SponsorshipConfig | null;
  className?: string;
}

export function SponsorshipSummary({
  config,
  className,
}: SponsorshipSummaryProps) {
  const perTransactionFeeCapStroops = config?.perTransactionFeeCapStroops ?? null;
  const spentTodayStroops = config?.spentTodayStroops ?? 0;
  const dailyBudgetStroops = config?.dailyBudgetStroops ?? null;

  const isDisabled = !config || config.enabled === false;

  return (
    <div className={className}>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">
          Per-transaction fee cap
        </span>
        <span className="text-sm text-gray-900">
          {perTransactionFeeCapStroops === null
            ? "—"
            : `${stroopsToXlm(perTransactionFeeCapStroops)} XLM`}
        </span>
      </div>

      <div className="mt-4">
        <BudgetMeter
          spentTodayStroops={spentTodayStroops}
          dailyBudgetStroops={dailyBudgetStroops}
        />
      </div>

      {isDisabled && (
        <p className="mt-4 text-sm text-gray-500">
          Sponsorship is currently disabled.
        </p>
      )}
    </div>
  );
}

export default SponsorshipSummary;