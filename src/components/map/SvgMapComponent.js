'use client';

import { useEffect, useRef, useState } from 'react';
import { koreaMapSvg } from '@/data/koreaMapSvg';

export default function SvgMapComponent({ onRegionSelect }) {
  const [selectedRegion, setSelectedRegion] = useState(null);
  const svgContainerRef = useRef(null);

  // SVG 요소들의 이벤트 핸들러 설정
  useEffect(() => {
    if (!svgContainerRef.current) return;

    // SVG DOM이 로드된 후
    const container = svgContainerRef.current;

    // 모든 지역 요소 선택
    const regions = container.querySelectorAll('.region');
    const regionGroups = container.querySelectorAll('g[id]');

    // 모든 지역에 기본 스타일 및 마우스 이벤트 핸들러 추가
    regionGroups.forEach((group) => {
      const regionId = group.id;
      const regionCode = group.getAttribute('data-code');
      const regionName = group.getAttribute('data-name');
      const regionPolygon = group.querySelector('.region');

      // 마우스 오버 효과 추가
      group.addEventListener('mouseenter', () => {
        if (selectedRegion && selectedRegion.code === regionCode) return;
        regionPolygon.style.fill = '#dbeafe'; // 연한 파란색
        regionPolygon.style.stroke = '#3b82f6'; // 진한 파란색
        regionPolygon.style.strokeWidth = '1.5px';

        // 지역명 글자 스타일 변경
        const regionText = group.querySelector('.region-name');
        if (regionText) {
          regionText.style.fontWeight = 'bold';
          regionText.style.fill = '#1e40af'; // 어두운 파란색
        }
      });

      // 마우스 아웃 효과 추가
      group.addEventListener('mouseleave', () => {
        if (selectedRegion && selectedRegion.code === regionCode) return;
        regionPolygon.style.fill = ''; // 기본 색상으로 복원
        regionPolygon.style.stroke = '';
        regionPolygon.style.strokeWidth = '';

        // 지역명 글자 스타일 복원
        const regionText = group.querySelector('.region-name');
        if (regionText) {
          regionText.style.fontWeight = '';
          regionText.style.fill = '';
        }
      });

      // 클릭 이벤트 핸들러
      group.addEventListener('click', () => {
        // 이전에 선택된 지역 스타일 초기화
        container.querySelectorAll('.region').forEach((el) => {
          el.style.fill = '';
          el.style.stroke = '';
          el.style.strokeWidth = '';
        });

        container.querySelectorAll('.region-name').forEach((el) => {
          el.style.fontWeight = '';
          el.style.fill = '';
        });

        // 현재 선택된 지역 스타일 설정
        regionPolygon.style.fill = '#93c5fd'; // 밝은 파란색
        regionPolygon.style.stroke = '#1d4ed8'; // 진한 파란색
        regionPolygon.style.strokeWidth = '2px';

        // 지역명 글자 스타일 변경
        const regionText = group.querySelector('.region-name');
        if (regionText) {
          regionText.style.fontWeight = 'bold';
          regionText.style.fill = '#1e3a8a'; // 더 어두운 파란색
        }

        // 선택된 지역 정보 설정
        const regionInfo = {
          code: regionCode,
          name: regionName,
          properties: {
            code: regionCode,
            name: regionName
          }
        };

        setSelectedRegion(regionInfo);
        onRegionSelect && onRegionSelect(regionInfo);
      });
    });

    return () => {
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      regionGroups.forEach((group) => {
        group.removeEventListener('mouseenter', () => {});
        group.removeEventListener('mouseleave', () => {});
        group.removeEventListener('click', () => {});
      });
    };
  }, [onRegionSelect, selectedRegion]);

  // 지도 리셋 함수
  const resetMap = () => {
    if (!svgContainerRef.current) return;

    const container = svgContainerRef.current;

    // 모든 지역 스타일 초기화
    container.querySelectorAll('.region').forEach((el) => {
      el.style.fill = '';
      el.style.stroke = '';
      el.style.strokeWidth = '';
    });

    container.querySelectorAll('.region-name').forEach((el) => {
      el.style.fontWeight = '';
      el.style.fill = '';
    });

    // 선택된 지역 정보 초기화
    setSelectedRegion(null);
    onRegionSelect && onRegionSelect(null);
  };

  return (
    <div style={{ overflow: 'auto', maxHeight: '100vh' }}>
      <div className="relative w-full h-[600px] md:h-[700px] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
        <div
          ref={svgContainerRef}
          className="w-full h-full"
          dangerouslySetInnerHTML={{
            __html: koreaMapSvg.replace(
              `<svg id="korea_map"`,
              `<svg id="korea_map" class="w-full h-full"`
            ),
          }}
        />

        {/* 지도 리셋 버튼 */}
        {selectedRegion && (
          <button
            onClick={resetMap}
            className="absolute top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md hover:bg-gray-100 flex items-center space-x-1"
            title="전국 지도로 돌아가기"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="text-sm text-gray-600">전체보기</span>
          </button>
        )}

        {/* 지도 정보 표시 */}
        <div className="absolute bottom-4 left-4 z-50 bg-white px-3 py-1 rounded-md shadow-md text-sm text-gray-600 pointer-events-none">
          {selectedRegion ? selectedRegion.name : '전국 지도'}
        </div>
      </div>
    </div>
  );
}