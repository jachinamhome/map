import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createCenteredText } from '@/utils/svgTextUtils';

// 전국지도용 텍스트 위치 보정 테이블
const nationwideTextOffsets = {
  '서울특별시': { x: 100, y: 20 },
  '경기도': { x: 120, y: 60 },
  '강원도': { x: 100, y: 20 },
  '충청북도': { x: 100, y: 20 },
  '충청남도': { x: 100, y: 40 },
  '전라북도': { x: 110, y: 20 },
  '전라남도': { x: 150, y: 20 },
  '경상북도': { x: 90, y: 20 },
  '경상남도': { x: 120, y: 20 },
  '제주특별자치도': { x: 0, y: 0 },
  '부산광역시': { x: 120, y: 20 },
  '대구광역시': { x: 110, y: 20 },
  '인천광역시': { x: 80, y: 20 },
  '광주광역시': { x: 110, y: 20 },
  '대전광역시': { x: 110, y: 20 },
  '울산광역시': { x: 110, y: 20 },
  '세종특별자치시': { x: 0, y: 0 },
  '제주특별자치도': { x: 110, y: 20 },
};

const NationwideMap = () => {
  const router = useRouter();
  const svgContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const handleRegionClick = (regionId) => {
    console.log(`지역 선택: ${regionId}`);
    // URL 인코딩된 지역 ID로 라우팅
    const encodedRegionId = encodeURIComponent(regionId);
    router.push(`/region/${encodedRegionId}`);
  };

  // 모바일 환경 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // 초기 체크
    checkMobile();

    // 리사이즈 이벤트에 대응
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    // SVG 파일을 직접 가져와서 DOM에 추가
    const fetchSvg = async () => {
      try {
        setLoading(true);
        const response = await fetch('/map/nationwide.svg');
        const svgText = await response.text();

        if (svgContainerRef.current) {
          svgContainerRef.current.innerHTML = svgText;

          // SVG 요소를 가져옴
          const svgElement = svgContainerRef.current.querySelector('svg');
          if (svgElement) {
            // SVG 크기 조정
            svgElement.setAttribute('width', '100%');
            svgElement.setAttribute('height', '100%');
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');

            // SVG 내부의 스타일 요소 제거 (파일 내 정의된 스타일 무시)
            const styleElements = svgElement.querySelectorAll('style');
            styleElements.forEach(style => style.remove());

            // SVG 그룹 요소 가져오기 (지역 그룹을 포함)
            const svgGroup = svgElement.querySelector('g') || svgElement;

            // 모든 path와 polyline 요소에 스타일과 이벤트 핸들러 추가
            const regions = [...svgGroup.querySelectorAll('polyline, path')];
            //console.log(`발견된 지역 수: ${regions.length}`);

            // 포함 관계에 있는 지역 아이디 매핑
            const containedRegions = {
              '전라남도': ['광주광역시'],
            };

            // 지역 ID별 요소 맵 생성
            const regionMap = {};

            // 모든 지역에 스타일 설정
            regions.forEach(region => {
              const id = region.getAttribute('id');
              if (id) regionMap[id] = region;

              // 기본 스타일 설정 - 모든 경계선은 흰색으로 고정
              region.style.fill = '#cdcccc';
              region.style.stroke = '#ffffff';
              region.style.strokeWidth = '1';
              region.style.transition = 'all 0.3s ease';
              region.style.cursor = 'pointer';

              // 중앙에 이름 텍스트 추가
              if (id) {
                const offset = nationwideTextOffsets[id] || { x: 0, y: 0 };
                const textElement = createCenteredText(region, id, {
                  minPadding: 20,
                  minAreaSize: 150,
                  fontSize: '16px',
                  fontWeight: '700',
                  textColor: '#444444',
                  xOffset: offset.x,
                  yOffset: offset.y,
                });
                region.parentNode.appendChild(textElement);
              }
            });

            // 현재 하이라이트된 지역 추적
            let currentHighlightedRegion = null;

            // 하이라이트 함수 - 배경색만 변경
            const highlightRegion = (regionId) => {
              // 이전 하이라이트 제거
              if (currentHighlightedRegion) {
                const prevRegion = regionMap[currentHighlightedRegion];
                if (prevRegion) {
                  prevRegion.style.fill = '#cdcccc';
                }

                // 포함된 지역 초기화
                if (containedRegions[currentHighlightedRegion]) {
                  containedRegions[currentHighlightedRegion].forEach(containedId => {
                    const containedRegion = regionMap[containedId];
                    if (containedRegion) {
                      containedRegion.style.fill = '#cdcccc';
                    }
                  });
                }
              }

              // 새 지역 하이라이트 - 배경색만 변경
              const region = regionMap[regionId];
              if (region) {
                // 내부 색상만 변경
                region.style.fill = '#ffcccc';

                // 내부 지역 처리 - 내부 지역은 하이라이트하지 않음
                if (containedRegions[regionId]) {
                  containedRegions[regionId].forEach(containedId => {
                    const containedRegion = regionMap[containedId];
                    if (containedRegion) {
                      // 내부 지역 색상은 유지
                      containedRegion.style.fill = '#cdcccc';
                    }
                  });
                }

                currentHighlightedRegion = regionId;
              }
            };

            // 하이라이트 제거
            const removeHighlight = () => {
              if (currentHighlightedRegion) {
                const region = regionMap[currentHighlightedRegion];
                if (region) {
                  region.style.fill = '#cdcccc';
                }

                // 내부 지역 처리
                if (containedRegions[currentHighlightedRegion]) {
                  containedRegions[currentHighlightedRegion].forEach(containedId => {
                    const containedRegion = regionMap[containedId];
                    if (containedRegion) {
                      containedRegion.style.fill = '#cdcccc';
                    }
                  });
                }

                currentHighlightedRegion = null;
              }
            };

            // 각 지역에 이벤트 핸들러 연결
            regions.forEach(region => {
              const regionId = region.getAttribute('id');
              if (regionId) {
                console.log(`지역 발견: ${regionId}`);

                // 모바일 터치 이벤트
                region.ontouchstart = (event) => {
                  console.log(`터치 시작: ${regionId}`);
                  highlightRegion(regionId);
                };

                // 데스크톱 마우스 이벤트
                region.onmouseenter = (event) => {
                  if (!isMobile) {
                    console.log(`마우스 오버: ${regionId}`);
                    highlightRegion(regionId);
                  }
                };

                region.onmouseleave = () => {
                  if (!isMobile) {
                    console.log(`마우스 아웃: ${regionId}`);
                    removeHighlight();
                  }
                };

                // 모바일과 데스크톱 모두 클릭/터치 이벤트
                region.onclick = () => {
                  console.log(`클릭: ${regionId}`);
                  handleRegionClick(regionId);
                };
              }
            });

            setLoading(false);
          }
        }
      } catch (error) {
        console.error('SVG 로드 중 오류 발생:', error);
        setLoading(false);
      }
    };

    fetchSvg();

    // 컴포넌트 언마운트 시 클린업
    return () => {
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = '';
      }
    };
  }, [router, isMobile]);

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <div className="w-full h-full max-w-4xl mx-auto relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <p className="text-gray-500 text-sm sm:text-base">지도를 불러오는 중...</p>
          </div>
        )}

        <div ref={svgContainerRef} className="w-full h-full"></div>
      </div>
    </div>
  );
};

export default NationwideMap;