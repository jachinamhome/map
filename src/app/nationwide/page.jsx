'use client';
import NationwideMap from '@/components/map/NationwideMap';

export default function NationwidePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-0">
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center">전국 지도</h1>
        <div className="w-full" style={{ height: 'calc(100vh - 160px)' }}>
          <div className="h-full bg-white rounded-lg shadow-lg p-2 sm:p-4 overflow-hidden">
            <NationwideMap />
          </div>
        </div>
      </div>
    </main>
  );
}
