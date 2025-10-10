export default function Brand() {
  return (
 // Sidebar.tsx (brand/header area)
<div className="flex items-center gap-2 px-4 py-3 select-none">
  <span className="font-light tracking-wide text-slate-300 text-[32px] leading-none">
    coordinate
    <span className="relative inline-block align-baseline leading-none">
      s
      <span
        aria-hidden
        className="pointer-events-none absolute block rounded-full border-amber-500"
        style={{
          width: 11,                 // px
          height: 11,
          border: '2px solid #F59E0B',
          top: -3,                  // px offsets
          right: -11,
        }}
      />
    </span>
  </span>
</div>

  );
}