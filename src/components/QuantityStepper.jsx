import { MAX_ORDER_QUANTITY } from '../constants/products.js';

/**
 * −/+ quantity control, shared by the product page and the cart.
 *
 * The glyphs are SVG rather than the "−" and "+" characters they replace. Those
 * were being laid out with the Urdu font's metrics, which centre punctuation on
 * a different baseline and pushed both signs out of their boxes; a stroked path
 * sits where it is drawn regardless of the inherited font.
 */
function StepButton({ onClick, disabled, label, compact, children }) {
  const box = compact ? 'h-9 w-9' : 'h-10 w-10';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`${box} flex shrink-0 items-center justify-center rounded-lg border border-gray-300 text-ink transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

const ICON = 'h-4 w-4';

function MinusIcon() {
  return (
    <svg className={ICON} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className={ICON} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = MAX_ORDER_QUANTITY,
  compact = false,
}) {
  return (
    <div className="flex items-center gap-2">
      <StepButton
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        label="تعداد کم کریں"
        compact={compact}
      >
        <MinusIcon />
      </StepButton>

      {/* LTR: an Urdu-direction container would otherwise flip a two-digit qty. */}
      <span dir="ltr" className="w-10 text-center font-semibold tabular-nums">
        {value}
      </span>

      <StepButton
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        label="تعداد بڑھائیں"
        compact={compact}
      >
        <PlusIcon />
      </StepButton>
    </div>
  );
}
