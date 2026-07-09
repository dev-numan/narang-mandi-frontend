const SOLD_STAMP_URL = '/sold-stamp-3.png';

export default function SoldStampOverlay() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <img
        src={SOLD_STAMP_URL}
        alt="فروخت ہو گیا"
        className="h-[85%] w-[85%] object-contain opacity-70"
      />
    </div>
  );
}
