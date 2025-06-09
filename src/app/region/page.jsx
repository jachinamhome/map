'use client';

import { useParams } from 'next/navigation';
import RegionMap from '@/components/map/RegionMap';
import { useEffect, useState } from 'react';

export default function RegionPage() {
  const params = useParams();
  const [decodedRegionId, setDecodedRegionId] = useState('');

  useEffect(() => {
    // URL 파라미터 디코딩
    if (params.id) {
      try {
        // URL 디코딩 후 base64 디코딩
        const decodedId = decodeURIComponent(params.id);
        setDecodedRegionId(decodedId);
      } catch (error) {
        console.error('지역 ID 디코딩 중 오류 발생:', error);
        setDecodedRegionId(params.id); // 디코딩 실패 시 원본 사용
      }
    }
  }, [params.id]);

  return (
    <main className="w-screen h-screen min-h-screen flex flex-col items-center justify-between p-0 bg-white">
      <RegionMap regionId={params.id} />
    </main>
  );
}
