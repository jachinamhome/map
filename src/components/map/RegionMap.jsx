/**
 * 지역별 부동산 지도 컴포넌트
 *
 * 이 컴포넌트는 전국 및 지역별 부동산 정보를 지도 형태로 보여주는 메인 화면입니다.
 * 주요 기능:
 * 1. 전국 지도와 지역별 지도 표시
 * 2. 지역 선택 및 필터링
 * 3. 부동산 정보 리스트 표시
 * 4. 지도 확대/축소 및 이동
 * 5. 모바일/데스크톱 환경 대응
 */
import { MdOutlineMap, MdFilterAlt } from 'react-icons/md';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { IoArrowBack, IoFilter, IoClose } from 'react-icons/io5';
import { FaChevronDown, FaChevronUp, FaPlus, FaMinus } from 'react-icons/fa';
import classnames from 'classnames';
import Select from 'react-select';
import { createCenteredText } from '@/utils/svgTextUtils';
import RegionMapList from './RegionMapList';
import RegionMapFilter from './RegionMapFilter';
import RegionMapSortBar from './RegionMapSortBar';
import RegionMapKeyword from './RegionMapKeyword';
import RegionSelectModal from './RegionSelectModal';
import { Button } from '../ui/button';



// 하단 리스트의 기본 높이 (픽셀 단위)
const LIST_HEIGHT = 260;

// 전국지도에서 지역명 텍스트 위치 보정을 위한 설정
// 각 지역별로 텍스트가 표시될 위치를 미세 조정하는 값
const nationwideTextOffsets = {
  '서울특별시': { x: 100, y: 20 },
  '경기도': { x: 120, y: 60 },
  '강원특별자치도': { x: 100, y: 20 },
  '충청북도': { x: 80, y: 20 },
  '충청남도': { x: 100, y: 40 },
  '전북특별자치도': { x: 110, y: 20 },
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

const RegionMap = () => {
  // 라우터 설정 - 페이지 이동을 위한 도구
  const router = useRouter();

  // 현재 선택된 지역 ID (기본값: 서울특별시)
  const [regionId, setRegionId] = useState('서울특별시');

  // 마우스가 올라간 지역 정보
  const [hoveredArea, setHoveredArea] = useState(null);

  // 툴팁(말풍선) 위치 정보
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // 선택된 지역 목록
  const [selectedAreas, setSelectedAreas] = useState([]);

  // 필터 모달 표시 여부
  const [showFilters, setShowFilters] = useState(false);

  // 선택된 계약 유형 (월세, 전세, 매매)
  const [contractTypes, setContractTypes] = useState([]);

  // 선택된 주거 유형 (원룸, 빌라 등)
  const [houseTypes, setHouseTypes] = useState([]);

  // 선택된 면적 범위
  const [sizes, setSizes] = useState([]);

  // 부동산 정보 목록
  const [videos, setVideos] = useState([]);

  // 정렬 기준 (날짜, 가격, 면적)
  const [sortType, setSortType] = useState('date');

  // 정렬 방향 (오름차순, 내림차순)
  const [sortOrder, setSortOrder] = useState('asc');

  // 키워드 모달 표시 여부
  const [showKeywords, setShowKeywords] = useState(false);

  // 선택된 키워드 목록
  const [selectedKeywords, setSelectedKeywords] = useState([]);

  // 추천 키워드 목록
  const [recommendedKeywords, setRecommendedKeywords] = useState([]);

  // 지도 관련 DOM 요소 참조
  const svgContainerRef = useRef(null);  // SVG 지도 컨테이너
  const mapContainerRef = useRef(null);  // 전체 지도 컨테이너

  // 로딩 상태
  const [loading, setLoading] = useState(true);

  // 모바일 환경 여부
  const [isMobile, setIsMobile] = useState(false);

  // 필터 패널 참조
  const filterPanelRef = useRef(null);

  // 지도 접힘 상태
  const [mapFolded, setMapFolded] = useState(false);

  // 지도 확대/축소 비율 (모바일: 1.5배, 데스크톱: 1배)
  const [mapScale, setMapScale] = useState(isMobile ? 1.5 : 1.25);

  // 지도 위치 정보
  const [mapPosition, setMapPosition] = useState({ x: 0, y: 0 });

  // 드래그 중인지 여부
  const [isDragging, setIsDragging] = useState(false);

  // SVG 로드 완료 여부
  const [svgLoaded, setSvgLoaded] = useState(false);

  // 드래그 시작 위치 정보
  const dragStartRef = useRef({ x: 0, y: 0, t: 0 });

  // 마지막 클릭 시간
  const [lastClickTime, setLastClickTime] = useState(0);

  // 스크롤 탑 버튼 표시 여부
  const [showScrollTop, setShowScrollTop] = useState(false);

  // 지역 옵션 목록
  const [regionOptions, setRegionOptions] = useState([]);

  // 지도 높이 (화면 높이의 60% 또는 기본값 350px)
  const [mapHeight, setMapHeight] = useState(typeof window !== 'undefined' ? window.innerHeight * 0.5 : 300);

  // SVG 원본 높이
  const [svgNaturalHeight, setSvgNaturalHeight] = useState(500);

  // 리사이징 중인지 여부
  const resizingRef = useRef(false);

  // 지역 선택 모달 표시 여부
  const [showRegionModal, setShowRegionModal] = useState(false);

  // 핀치 줌(손가락으로 확대/축소) 관련 정보
  const pinchRef = useRef({
    initialDistance: null,  // 초기 두 손가락 사이 거리
    initialScale: 1,       // 초기 확대/축소 비율
    lastCenter: { x: 0, y: 0 }  // 마지막 중심점
  });


const [autoExpanded, setAutoExpanded] = useState(false); // 자동 확장 상태
const scrollRef = useRef(null); // 영상 리스트 스크롤 요소 참조

  // 필터 옵션 상수 정의
  const contractOptions = ['월세', '전세', '매매'];  // 계약 유형 옵션
  const houseTypeOptions = ['원룸', '빌라/투룸+', '오피스텔', '아파트'];  // 주거 유형 옵션
  const sizeOptions = ['~5평대', '6평대', '7평대', '8평대', '9평대', '10평대~'];  // 면적 옵션

  // 전국 지역 목록 정의
  const nationRegionList = [
    { id: '서울특별시', label: '서울' },
    { id: '경기도', label: '경기' },
    { id: '인천광역시', label: '인천' },
    { id: '부산광역시', label: '부산' },
    { id: '대구광역시', label: '대구' },
    { id: '광주광역시', label: '광주' },
    { id: '대전광역시', label: '대전' },
    { id: '울산광역시', label: '울산' },
    { id: '세종특별자치시', label: '세종' },
    { id: '강원특별자치도', label: '강원' },
    { id: '충청북도', label: '충북' },
    { id: '충청남도', label: '충남' },
    { id: '전북특별자치도', label: '전북' },
    { id: '전라남도', label: '전남' },
    { id: '경상북도', label: '경북' },
    { id: '경상남도', label: '경남' },
    { id: '제주특별자치도', label: '제주' },
  ];

  /**
   * 뒤로가기 버튼 클릭 처리
   * 전국 지도 화면으로 이동
   */
  const handleBackClick = () => {
    router.push('/nationwide');
  };

  /**
   * 지역 클릭 처리
   * @param {string} areaId - 클릭된 지역의 ID
   */
  const handleAreaClick = (areaId) => {
    if (!areaId) return;

    console.log(`클릭된 지역: ${regionId}, 세부 지역: ${areaId}`);
    const region = nationRegionList.find(r => r.id === areaId);
    const normalizedAreaId = region ? region.label : areaId.replace(/\s+/g, '').replace(/[^\w가-힣]/g, '');

    // 선택된 지역 목록 업데이트
    setSelectedAreas(prev => {
      const isAlreadySelected = prev.some(id => id === normalizedAreaId);
      const newSelectedAreas = isAlreadySelected
        ? prev.filter(id => id !== normalizedAreaId)
        : [...prev, normalizedAreaId];
      return newSelectedAreas;
    });
  };

  /**
   * 필터 변경 처리
   * @param {string} type - 필터 유형 (contract, houseType, size)
   * @param {string} value - 선택된 값
   */
  const handleFilterChange = (type, value) => {
    switch (type) {
      case 'contract':
        // 계약 유형 필터 업데이트
        setContractTypes(prev => {
          if (prev.includes(value)) {
            return prev.filter(v => v !== value);
          } else {
            return [...prev, value];
          }
        });
        break;
      case 'houseType':
        // 주거 유형 필터 업데이트
        setHouseTypes(prev => {
          if (prev.includes(value)) {
            return prev.filter(v => v !== value);
          } else {
            return [...prev, value];
          }
        });
        break;
      case 'size':
        // 면적 필터 업데이트
        setSizes(prev => {
          if (prev.includes(value)) {
            return prev.filter(v => v !== value);
          } else {
            return [...prev, value];
          }
        });
        break;
    }
  };

  /**
   * 모든 필터 초기화
   */
  const resetFilters = () => {
    setSelectedAreas([]);
    setContractTypes([]);
    setHouseTypes([]);
    setSizes([]);
  };

  /**
   * 지도 확대 처리
   * 최대 3배까지 확대 가능
   */
  const handleScaleUp = () => setMapScale((prev) => Math.min(prev + 0.2, 3));

  /**
   * 지도 축소 처리
   * 최소 1.2배까지 축소 가능
   */
  const handleScaleDown = () => setMapScale((prev) => Math.max(prev - 0.2, 1.2));

  /**
   * 지도 드래그 시작 처리
   * @param {Event} e - 포인터 이벤트
   */
  const handlePointerDown = (e) => {
    let clientX, clientY;
    if (e.touches) {
      // 모바일 터치 이벤트 처리
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      // 마우스 이벤트 처리
      clientX = e.clientX;
      clientY = e.clientY;
      e.preventDefault();
    }
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX - mapPosition.x,
      y: clientY - mapPosition.y,
      t: Date.now()
    };
    setHoveredArea(null);
  };

  /**
   * 지도 드래그 중 처리
   * @param {Event} e - 포인터 이벤트
   */
  const handlePointerMove = (e) => {
    if (!isDragging) return;
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
      e.preventDefault();
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
      e.preventDefault();
    }

    // 새로운 위치 계산
    const newX = clientX - dragStartRef.current.x;
    const newY = clientY - dragStartRef.current.y;

    // 지도 경계 계산
    const containerWidth = mapContainerRef.current?.clientWidth || 0;
    const containerHeight = mapContainerRef.current?.clientHeight || 0;
    const maxX = containerWidth * (mapScale - 1) / 2;
    const maxY = containerHeight * (mapScale - 1) / 2;

    // 지도 위치 업데이트 (경계 내에서만)
    if (mapScale > 1) {
      setMapPosition({
        x: Math.min(Math.max(newX, -maxX), maxX),
        y: Math.min(Math.max(newY, -maxY), maxY)
      });
    }

    // 호버 상태 초기화
    if (hoveredArea) {
      setHoveredArea(null);
    }
  };

  /**
   * 지도 드래그 종료 처리
   * @param {Event} e - 포인터 이벤트
   */
  const handlePointerUp = (e) => {
    if (e.touches) {
      e.preventDefault();
    }
    setIsDragging(false);
  };

  /**
   * 마우스 휠로 지도 확대/축소 처리
   * @param {Event} e - 휠 이벤트
   */
  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      // 휠 위로 (확대)
      handleScaleUp();
    } else {
      // 휠 아래로 (축소)
      handleScaleDown();
    }
  };

  // 모바일 환경 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // 이벤트 리스너 설정
  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (mapContainer) {
      // 마우스 휠, 터치 이벤트 리스너 등록
      mapContainer.addEventListener('wheel', handleWheel, { passive: false });
      mapContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
      mapContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
      mapContainer.addEventListener('touchend', handleTouchEnd, { passive: false });

      // 이벤트 리스너 제거
      return () => {
        mapContainer.removeEventListener('wheel', handleWheel);
        mapContainer.removeEventListener('touchmove', handleTouchMove);
        mapContainer.removeEventListener('touchstart', handleTouchStart);
        mapContainer.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, []);

  // 지도 접힘/펼침 상태 변경 시 위치 초기화
  useEffect(() => {
    setMapPosition({ x: 0, y: 0 });
    setMapScale(1.5); // 50% 확대
    if (!mapFolded && svgLoaded) {
      const svgElement = svgContainerRef.current?.querySelector('svg');
      if (svgElement) {
        svgElement.style.display = 'block';
      }
    }
  }, [mapFolded]);

  // 필터 패널 외부 클릭 시 닫기
  useEffect(() => {
    if (!showFilters) return;
    const handleClickOutside = (event) => {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target) &&
        !event.target.closest('.filter-toggle-btn')
      ) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilters]);

  // 데이터 로드
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const response = await fetch('/data/videosData.json');
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('데이터 로드 중 오류 발생:', error);
      }
    };

    loadVideos();
  }, []);

  // handleAreaClick 최신 참조를 위한 useRef
  const handleAreaClickRef = useRef(handleAreaClick);
  useEffect(() => {
    handleAreaClickRef.current = handleAreaClick;
  }, [handleAreaClick]);

  // SVG 로드 및 이벤트 핸들러 설정
  useEffect(() => {
    let isMounted = true;

    const fetchSvg = async () => {
      try {
        if (!isMounted) return;
        setLoading(true);
        setSvgLoaded(false);

        const svgPath = regionId ? `/map/${regionId}.svg` : '/map/nationwide.svg';
        const response = await fetch(svgPath);
        const svgText = await response.text();

        if (!svgContainerRef.current || !isMounted) return;

        svgContainerRef.current.innerHTML = svgText;
        const svgElement = svgContainerRef.current.querySelector('svg');
        if (!svgElement) return;

        svgElement.setAttribute('width', '100%');
        svgElement.setAttribute('height', '100%');
        svgElement.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        setSelectedAreas([]);

        // 스타일 요소 제거
        const styleElements = svgElement.querySelectorAll('style');
        styleElements.forEach(style => style.remove());

        const areas = [...svgElement.querySelectorAll('polyline, path')];
        window.areaMap = {};
        const regionList = [];

        areas.forEach(area => {
          const id = area.getAttribute('id');
          if (!id) return;

          window.areaMap[id] = area;
          const normalizedId = id.replace(/\s+/g, '').replace(/[^\w가-힣]/g, '');

          if (!regionId) {
            // 전국지도일 때는 regionList의 label 사용
            const region = nationRegionList.find(r => decodeURIComponent(r.id) === id);
            //regionList.push({ value: normalizedId, label: region ? region.label : id });
          } else {
            // 특정 지역일 때는 기존 방식대로 ID 사용
            regionList.push({ value: normalizedId, label: id });
          }

          // 텍스트 요소 생성 및 추가
          const offset = regionId === null && nationwideTextOffsets[id] ? nationwideTextOffsets[id] : { x: 0, y: 0 };
          const fontSize = ["인천광역시"].includes(decodeURIComponent(regionId)) ? '7px' : '14px';
          const textElement = createCenteredText(regionId, area, !regionId ? (regionList.find(r => r.id === id)?.label || id) : id, {
            minPadding: 20,
            minAreaSize: 150,
            fontSize: fontSize,
            fontWeight: '700',
            textColor: '#444444',
            xOffset: offset.x,
            yOffset: offset.y
          });
          area.parentNode.appendChild(textElement);

          // 기본 스타일 설정
          area.style.fill = '#e0e0e0';
          area.style.stroke = '#ffffff';
          area.style.strokeWidth = '2';
          area.style.transition = 'all 0.3s ease';
          area.style.cursor = 'pointer';

          // 마우스 오버/아웃 하이라이트 처리
          area.onmouseenter = () => setHoveredArea(id);
          area.onmouseleave = () => setHoveredArea(null);

          // 클릭 이벤트 처리
          area.onclick = (e) => {
            e.stopPropagation();
            if (!regionId) {
              setRegionId(id);
              setMapPosition({ x: 0, y: 0 });
              setMapScale(1.5);
            } else {
              handleAreaClick(id);
            }
          };
        });

        if (!isMounted) return;

        updateSelectedAreasHighlight();
        setRegionOptions(regionList);
        setLoading(false);
        setSvgLoaded(true);
        setMapScale(1.5);
        setMapPosition({ x: 0, y: 0 });

      } catch (error) {
        console.error('SVG 로드 중 오류 발생:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSvg();

    return () => {
      isMounted = false;
      if (svgContainerRef.current) {
        svgContainerRef.current.innerHTML = '';
      }
      window.areaMap = null;
    };
  }, [regionId, isMobile]);


// 자동 스크롤 확장/축소 감지
useEffect(() => {
  if (!isMobile) return;

  const scrollEl = scrollRef.current;
  if (!scrollEl) return;

  let ticking = false;

  const handleScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const scrollTop = scrollEl.scrollTop;

        if (!autoExpanded && scrollTop < 30) {
          setMapHeight(window.innerHeight * 0.6); // 최대 확장
          setMapFolded(false);
          setAutoExpanded(true);
        } else if (autoExpanded && scrollTop > 10) {
          setMapHeight(80); // 최소 축소
          setMapFolded(true);
          setAutoExpanded(false);
        }

        ticking = false;
      });

      ticking = true;
    }
  };

  scrollEl.addEventListener("scroll", handleScroll);
  return () => scrollEl.removeEventListener("scroll", handleScroll);
}, [autoExpanded, isMobile]);



  // 선택된 지역 하이라이트 함수
  const updateSelectedAreasHighlight = () => {
    if (!window.areaMap) return;

    console.log('현재 선택된 지역들:', selectedAreas); // 디버깅용 로그

    // 모든 영역을 기본 색상으로 초기화
    Object.values(window.areaMap).forEach(area => {
      area.style.fill = '#e0e0e0';
    });

    // 선택된 영역 색상 변경
    selectedAreas.forEach(selectedId => {
      // 원본 ID로 매칭 시도
      const area = window.areaMap[selectedId];
      if (area) {
        area.style.fill = '#FFE066';
        console.log(`영역 색상 변경 성공: ${selectedId}`); // 디버깅용 로그
      } else {
        // 정규화된 ID로 매칭 시도
        const normalizedSelectedId = selectedId.replace(/\s+/g, '').replace(/[^\w가-힣]/g, '');
        const normalizedArea = Object.entries(window.areaMap).find(([id]) =>
          id.replace(/\s+/g, '').replace(/[^\w가-힣]/g, '') === normalizedSelectedId
        );
        if (normalizedArea) {
          normalizedArea[1].style.fill = '#FFE066';
          console.log(`영역 색상 변경 성공 (정규화): ${selectedId}`); // 디버깅용 로그
        } else {
          console.log(`영역을 찾을 수 없음: ${selectedId}`); // 디버깅용 로그
        }
      }
    });

    // 호버된 영역 색상 변경
    if (hoveredArea) {
      const normalizedHoveredArea = hoveredArea.replace(/\s+/g, '').replace(/[^\w가-힣]/g, '');
      const hoveredElement = window.areaMap[hoveredArea] ||
        Object.entries(window.areaMap).find(([id]) =>
          id.replace(/\s+/g, '').replace(/[^\w가-힣]/g, '') === normalizedHoveredArea
        )?.[1];
      if (hoveredElement && !selectedAreas.includes(normalizedHoveredArea)) {
        hoveredElement.style.fill = '#FFE066';
      }
    }
  };

  // 선택된 지역과 호버된 지역 하이라이트 업데이트를 위한 useEffect
  useEffect(() => {
    if (window.areaMap) {
      console.log('useEffect - 선택된 지역:', selectedAreas); // 디버깅용 로그
      requestAnimationFrame(() => {
        updateSelectedAreasHighlight();
      });
    }
  }, [selectedAreas, hoveredArea]);

  // 가격 포맷 함수 수정
  const formatDeposit = (deposit) => {
    if (!deposit && deposit !== 0) return '';
    deposit = Number(deposit);
    if (deposit >= 10000) {
      const eok = Math.floor(deposit / 10000);
      const man = deposit % 10000;
      return man > 0 ? `${eok}억 ${man}` : `${eok}억`;
    }
    return `${deposit}`;
  };

  const formatSize = (type, size) => {
    const size2 = Math.floor(size * 3.3 * 10) / 10;
    return `${type} ${size}평 (${size2}㎡)`;
  }

  // 추천 키워드 생성 함수
  const generateRecommendedKeywords = useCallback(() => {
    // 모든 태그 수집 및 빈도수 계산
    const tagFrequency = {};
    videos.forEach(video => {
      if (video.tags) {
        video.tags.forEach(tag => {
          if (tag && tag.trim().length > 0) {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
          }
        });
      }
    });

    // 빈도수 기준으로 정렬하고 상위 20개 선택
    return Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20)
      .map(([tag]) => tag);
  }, [videos]);

  // 비디오 데이터 로드 시 추천 키워드 생성
  useEffect(() => {
    if (videos.length > 0) {
      setRecommendedKeywords(generateRecommendedKeywords());
    }
  }, [videos, generateRecommendedKeywords]);

  // 면적 필터를 연속된 범위로 묶는 함수
  const getGroupedSizes = (selectedSizes) => {
    if (selectedSizes.length === 0) return [];

    const sizeValues = selectedSizes.map(size => {
      if (size === '~5평대') return 5;
      if (size === '10평대~') return 10;
      return parseInt(size);
    }).sort((a, b) => a - b);

    const groups = [];
    let currentGroup = [sizeValues[0]];

    for (let i = 1; i < sizeValues.length; i++) {
      if (sizeValues[i] === sizeValues[i-1] + 1) {
        currentGroup.push(sizeValues[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [sizeValues[i]];
      }
    }
    groups.push(currentGroup);

    return groups.map(group => {
      if (group.length === 1) {
        if (group[0] === 5) return '~5평대';
        if (group[0] === 10) return '10평대~';
        return `${group[0]}평대`;
      }
      if (group[0] === 5) return `~${group[group.length-1]}평대`;
      if (group[group.length-1] === 10) return `${group[0]}평대~`;
      return `${group[0]}~${group[group.length-1]}평대`;
    });
  };


  // 계약 유형 키워드 필터
    const contractTypeKeywords = {
    '월세': ['월세', '반전세'],
    '전세': ['전세'],
    '매매': ['매매']
  };

  // 주거 유형 키워드 필터
    const houseTypeKeywords = {
    "원룸": ["원룸", "1.5룸"],
    "빌라/투룸+": ["빌라", "주택", "투룸", "쓰리룸"],
    "오피스텔": ["오피스텔"],
    "아파트": ["아파트"]
  };


  // 필터링된 비디오 목록
  const filteredVideos = videos.filter(video => {
    // 광역단체 필터
    if (regionId !== null) {
      const region = nationRegionList.find(r => r.id === (regionId));
      if (!region || video.region !== region.id) {
        return false;
      }
    }

    // undefined 유튜브 ID 체크 및 콘솔 출력
    if (!video.youtube) {
      return false;
    }

    // 지역 필터
    if (selectedAreas.length > 0) {
      if (!selectedAreas.includes(video.area)) {
        return false;
      }
    }

    // 계약 유형 필터
      if (contractTypes.length > 0) {
        const videoContract = video.contract;
        const match = contractTypes.some(selected => {
          const keywords = contractTypeKeywords[selected] || [];
          return keywords.includes(videoContract);
        });
        if (!match) return false;
      }

    // 주거 유형 필터
    if (houseTypes.length > 0) {
      const videoType = video.type;
      const match = houseTypes.some(selected => {
        const keywords = houseTypeKeywords[selected] || [];
        return keywords.some(keyword => videoType.includes(keyword));
      });
      if (!match) return false;
    }



    // 키워드 필터
    if (selectedKeywords.length > 0) {
      const videoTags = video.tags || [];
      if (!selectedKeywords.some(keyword => videoTags.includes(keyword))) {
        return false;
      }
    }

    // 면적 필터
    if (sizes.length > 0) {
      const video_size = parseInt(video.size);
      const sizeValues = sizes.map(size => {
        if (size === '~5평대') return 5;
        if (size === '10평대~') return 10;
        return parseInt(size);
      }).sort((a, b) => a - b);

      const groups = [];
      let currentGroup = [sizeValues[0]];

      for (let i = 1; i < sizeValues.length; i++) {
        if (sizeValues[i] === sizeValues[i-1] + 1) {
          currentGroup.push(sizeValues[i]);
        } else {
          groups.push(currentGroup);
          currentGroup = [sizeValues[i]];
        }
      }
      groups.push(currentGroup);

      return groups.some(group => {
        if (group.length === 1) {
          if (group[0] === 5) return video_size <= 5;
          if (group[0] === 10) return video_size >= 10;
          return video_size === group[0];
        }
        if (group[0] === 5) return video_size <= group[group.length-1];
        if (group[group.length-1] === 10) return video_size >= group[0];
        return video_size >= group[0] && video_size <= group[group.length-1];
      });
    }

    return true;
  });

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (window.scrollY > 200) {
      setShowScrollTop(true);
    } else {
      setShowScrollTop(false);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // 정렬 함수
  const getSortedVideos = (videos) => {
    return [...videos].sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;

      switch (sortType) {
        case 'date':
          return multiplier * (new Date(b.date || 0) - new Date(a.date || 0));

        case 'price':
        const getPrice = (video) => {
          if (['월세', '반전세'].includes(video.contract)) {
            return (video.deposit || 0) + ((video.rent || 0) * 200);
          } else if (video.contract === '전세') {
            return video.deposit || 0;
          } else if (video.contract === '매매') {
            return video.sale || video.deposit || 0;
          }
          return 0;
        };
        return multiplier * (getPrice(a) - getPrice(b));

        case 'size':
          return multiplier * ((a.size || 0) - (b.size || 0));

        default:
          return 0;
      }
    });
  };

  // 정렬 버튼 클릭 핸들러
  const handleSort = (type) => {
    if (sortType === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortType(type);
      setSortOrder('desc');
    }
  };

  // SVG 로드 후 실제 높이 측정
  useEffect(() => {
    if (!svgContainerRef.current) return;
    const svg = svgContainerRef.current.querySelector('svg');
    if (!svg) return;
    let height = 0;
    if (svg.hasAttribute('viewBox')) {
      const vb = svg.getAttribute('viewBox').split(' ');
      height = parseFloat(vb[3]);
    } else if (svg.hasAttribute('height')) {
      height = parseFloat(svg.getAttribute('height'));
    }
    if (height && !isNaN(height)) {
      setSvgNaturalHeight(height);
    }
  }, [regionId, svgLoaded]);

  // 모바일 리사이저 드래그 핸들러 수정
  const handleResizerMouseDown = (e) => {
    //e.preventDefault();
    resizingRef.current = true;
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingRef.current) return;
      const windowHeight = window.innerHeight;
      const touchY = e.touches ? e.touches[0].clientY : e.clientY;
      // 최소 80, 최대 windowHeight-80
      const minHeight = 80;
      const maxHeight = windowHeight - 80;
      const newHeight = Math.max(minHeight, Math.min(touchY, maxHeight));
      setMapHeight(newHeight);
      setMapFolded(newHeight <= minHeight + 20);
    };
    const handleMouseUp = () => {
      if (resizingRef.current) {
        resizingRef.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    // touchmove에서 preventDefault 추가
    const handleTouchMove = (e) => {
      if (!resizingRef.current) return;
      e.preventDefault(); // 모바일에서 스크롤/새로고침 방지
      handleMouseMove(e);
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  // 현재 지역이 regionList에 없을 때도 select가 정상 동작하도록
  const currentRegionValue = nationRegionList.find(r => r.id === regionId) ? regionId : nationRegionList[0].id;

  // 핀치 줌 처리
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const [touch1, touch2] = e.touches;
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      pinchRef.current.initialDistance = Math.sqrt(dx * dx + dy * dy);
      pinchRef.current.initialScale = mapScale;
      pinchRef.current.lastCenter = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };
      setIsDragging(false);
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsDragging(true);
      dragStartRef.current = {
        x: touch.clientX - mapPosition.x,
        y: touch.clientY - mapPosition.y,
        t: Date.now()
      };
    }
  };

  const handleTouchMove = (e) => {
    //e.preventDefault();
    if (e.touches.length === 2 && pinchRef.current.initialDistance) {
      const [touch1, touch2] = e.touches;
      const dx = touch2.clientX - touch1.clientX;
      const dy = touch2.clientY - touch1.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const scale = Math.max(1.2, Math.min(3, pinchRef.current.initialScale * (distance / pinchRef.current.initialDistance))); // 최소 120%로 설정

      setMapScale(scale);

      // 중심점 기준으로 이동
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2
      };

      setMapPosition((prev) => ({
        x: prev.x + (center.x - pinchRef.current.lastCenter.x),
        y: prev.y + (center.y - pinchRef.current.lastCenter.y)
      }));

      pinchRef.current.lastCenter = center;
    } else if (e.touches.length === 1 && isDragging) {
      const touch = e.touches[0];
      const newX = touch.clientX - dragStartRef.current.x;
      const newY = touch.clientY - dragStartRef.current.y;
      const containerWidth = mapContainerRef.current?.clientWidth || 0;
      const containerHeight = mapContainerRef.current?.clientHeight || 0;
      const maxX = containerWidth * (mapScale - 1) / 2;
      const maxY = containerHeight * (mapScale - 1) / 2;
      if (mapScale > 1) {
        setMapPosition({
          x: Math.min(Math.max(newX, -maxX), maxX),
          y: Math.min(Math.max(newY, -maxY), maxY)
        });
      }
    }
  };

  const handleTouchEnd = (e) => {
    //e.preventDefault();
    if (e.touches.length < 2) {
      pinchRef.current.initialDistance = null;
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  // 모달 버튼 클릭 핸들러
  const handleModalButtonClick = (modalType) => {
    switch (modalType) {
      case 'filter':
        setShowFilters(prev => !prev);
        break;
      case 'keyword':
        setShowKeywords(prev => !prev);
        break;
      case 'region':
        setShowRegionModal(true);
        break;
    }
  };

  return (
    <div className="fixed inset-0 w-full h-[100dvh] overflow-hidden bg-white">
      {/* 지도 배경 */}
      <div className="absolute inset-0 z-0">
        {/* 모바일: 지도+리사이저+목록 분할 */}
        {isMobile ? (
          <>
            <div
              ref={mapContainerRef}
              className="w-full relative"
              /* style={{ height: `${mapHeight}px`, transition: 'height 0.2s' }} */
              style={{
                height: `${mapHeight}px`,
                transition: 'height 0.2s',
                maxHeight: 'calc(100dvh - 8px)'
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* 지도 SVG 등 기존 내용 */}
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                  <p className="text-gray-500 text-sm sm:text-base">지도를 불러오는 중...</p>
                </div>
              )}
              <div
                ref={svgContainerRef}
                className="w-full h-full"
                style={{
                  transform: `scale(${mapScale}) translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                  cursor: isDragging ? 'grabbing' : (mapScale > 1 ? 'grab' : 'default'),
                  minWidth: '100vw',
                  minHeight: '100vh',
                  margin: 0,
                  padding: 0,
                  touchAction: 'none',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  willChange: 'transform'
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
              {/* 오른쪽 상단: 필터/키워드/지역선택 버튼 */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex gap-2 items-center">
                <Button
                  className="bg-black text-white border border-black rounded-full w-24 h-9 px-4 sm:px-6 shadow-lg font-semibold flex items-center hover:bg-gray-700 transition-all hover:shadow-xl whitespace-nowrap text-sm"
                  onClick={() => setRegionId(null)}
                >
                  <MdOutlineMap className="w-5 h-5" />
                  전국
                </Button>
                <button
                  onClick={() => handleModalButtonClick('region')}
                  className="bg-black text-white border border-black rounded-full w-23 h-9 px-4 sm:px-6 shadow-lg font-semibold flex items-center hover:bg-gray-50 transition-all hover:shadow-xl whitespace-nowrap text-sm"
                >
                  {nationRegionList.find(r => r.id === decodeURIComponent(regionId))?.label || '지역'}　
                  <FaChevronDown className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleModalButtonClick('filter')}
                  className="bg-white border border-black text-black rounded-full h-9 px-4 sm:px-6 shadow-lg font-semibold flex items-center hover:bg-gray-50 transition-all hover:shadow-xl whitespace-nowrap text-xs"
                >
                  <MdFilterAlt className="w-4 h-4 mr-1" />
                  필터
                </button>
                <button
                  onClick={() => handleModalButtonClick('keyword')}
                  className={`flex items-center rounded-full h-9 px-4 sm:px-6 shadow-lg font-semibold border transition-all hover:shadow-xl whitespace-nowrap text-xs ${
                    showKeywords
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white border-black text-black hover:bg-gray-50'
                  }`}
                >
                  <span className="text-sm mr-1">Aa</span>
                  키워드
                </button>
              </div>
              {/* 확대/축소 버튼 - 모바일은 우측, 데스크탑은 우측 */}
              <div className={`fixed z-20 flex flex-col gap-2 ${isMobile ? 'top-30 right-6' : 'top-4 right-4'}`}>
                {/* <button onClick={handleScaleUp} className="bg-white/90 border border-blue-300 text-blue-500 rounded-full p-2 shadow-lg hover:bg-blue-50 transition-colors"><FaPlus /></button>
                <button onClick={handleScaleDown} className="bg-white/90 border border-blue-300 text-blue-500 rounded-full p-2 shadow-lg hover:bg-blue-50 transition-colors"><FaMinus /></button> */}
                <button onClick={handleScaleUp} className="bg-white/90 border border-gray-300 text-gray-500 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"><FaPlus /></button>
                <button onClick={handleScaleDown} className="bg-white/90 border border-gray-300 text-gray-500 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"><FaMinus /></button>
              </div>

              {/* 관악구/강남구 툴팁 - 모바일 
              {['관악구', '강남구'].some(area => selectedAreas.includes(area)) && (
                <div className="fixed right-4 z-50 flex flex-col gap-2" style={{ top: `${mapHeight - 80}px` }}>
                  {['관악구', '강남구'].map((area) =>
                    selectedAreas.includes(area) ? (
                      <a
                        key={area}
                        href={
                          area === '관악구'
                            ? 'https://map.naver.com/p/entry/place/1306435818?c=15.00,0,0,0,dh'
                            : 'https://map.naver.com/p/entry/place/1280371285'
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs"
                      >
                        <div className="flex items-center gap-2 bg-yellow-400 text-black rounded-xl px-2 py-1 shadow-md animate-fade-in">
                          <img src="/HomeSearch.svg" alt="집 찾기" className="w-6 h-6" />
                          <span className="font-semibold"><b>{area}</b> 집을 찾고 계신가요?</span>
                        </div>
                      </a>
                    ) : null
                  )}
                </div>
              )}*/}
            </div>

            {/* 비디오 목록 */}
            <div
              ref={scrollRef}  
              className="fixed left-0 right-0 bottom-0 z-30 bg-white/90 shadow-2xl overflow-y-auto"
              style={{
                top: `${mapHeight}px`, // ← mapHeight로 위에서부터 내려온 높이
                height: `calc(100dvh - ${mapHeight}px)`,
                transition: 'top 0.3s ease, height 0.3s ease',
                touchAction: 'pan-y',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* 리사이저 */}
              <div
                className="w-full h-12 flex items-center justify-center cursor-row-resize sticky top-0 z-50 bg-white/90"
                onMouseDown={handleResizerMouseDown}
                onTouchStart={handleResizerMouseDown}
              >
                <div className="w-14 h-1 bg-gray-300 rounded-full shadow-sm" />
              </div>

              {/* 상단 고정 통합 영역 */}
              <div className="sticky top-0 z-40 bg-white">

              {/* 정렬 바 */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-4 border-b border-gray-100 z-10 shadow-sm flex flex-row justify-between items-center gap-2 w-full">
                <div className="flex flex-row items-center font-bold justify-between gap-4 pb-4">
                  <span className="text-gray-500 text-sm whitespace-nowrap">{filteredVideos.length}개 집을 찾았어요</span>
                </div>
                <div className="flex flex-row gap-2 flex-shrink-0 justify-end">
                  <button
                    onClick={() => handleSort('date')}
                    className={`px-3 py-1 rounded-full text-xs border transition-all hover:shadow-md ${
                      sortType === 'date'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    날짜순 {sortType === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                  <button
                    onClick={() => handleSort('price')}
                    className={`px-3 py-1 rounded-full text-xs border transition-all hover:shadow-md ${
                      sortType === 'price'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    가격순 {sortType === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                  <button
                    onClick={() => handleSort('size')}
                    className={`px-3 py-1 rounded-full text-xs border transition-all hover:shadow-md ${
                      sortType === 'size'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    크기순 {sortType === 'size' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </button>
                </div>
              </div>

              {/* 선택된 필터/키워드 태그들 */}
              {(selectedAreas.length > 0 || contractTypes.length > 0 || houseTypes.length > 0 || sizes.length > 0 || selectedKeywords.length > 0) && (
                <div className="sticky top-0 z-40 bg-white flex flex-wrap gap-2 px-4 pt-2 pb-2 border-b border-gray-100">
                  {selectedAreas.map(area => (
                    <span key={area} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs flex items-center">
                      {area}
                      <button onClick={() => handleAreaClick(area)} className="ml-1 text-blue-400 hover:text-blue-600">
                        <IoClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {contractTypes.map(type => (
                    <span key={type} className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs flex items-center">
                      {type}
                      <button onClick={() => handleFilterChange('contract', type)} className="ml-1 text-green-400 hover:text-green-600">
                        <IoClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {houseTypes.map(type => (
                    <span key={type} className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs flex items-center">
                      {type}
                      <button onClick={() => handleFilterChange('houseType', type)} className="ml-1 text-purple-400 hover:text-purple-600">
                        <IoClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getGroupedSizes(sizes).map(size => (
                        <span key={size} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs flex items-center">
                          {size}
                          <button onClick={() => {
                            const sizeValues = size.split(/[~]/).map(s => s.replace('평대', ''));
                            const newSizes = sizes.filter(s => {
                              const value = s === '~5평대' ? 5 : s === '10평대~' ? 10 : parseInt(s);
                              return !(value >= parseInt(sizeValues[0]) && value <= parseInt(sizeValues[sizeValues.length - 1]));
                            });
                            setSizes(newSizes);
                          }} className="ml-1 text-orange-400 hover:text-orange-600">
                            <IoClose className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedKeywords.map(keyword => (
                    <span key={keyword} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      {keyword}
                      <button
                        onClick={() => setSelectedKeywords(prev => prev.filter(k => k !== keyword))}
                        className="ml-1 text-yellow-400 hover:text-yellow-600"
                      >
                        <IoClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              </div>

              <div className="px-4 py-4 video-list">
                <RegionMapList
                  videos={filteredVideos}
                  getSortedVideos={getSortedVideos}
                  formatDeposit={formatDeposit}
                  formatSize={formatSize}
                />
              </div>
            </div>
          </>
        ) : (
          // 데스크탑: 리스트와 지도 영역 분리
          <div className="flex h-screen">

            {/* 좌측 지도 영역 */}
            <div className="flex-1 relative overflow-hidden">
              <div
                ref={mapContainerRef}
                className="w-full h-full relative"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onWheel={(e) => {
                  e.preventDefault();
                  if (e.deltaY < 0) {
                    handleScaleUp();
                  } else {
                    handleScaleDown();
                  }
                }}
              >
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
                    <p className="text-gray-500 text-sm sm:text-base">지도를 불러오는 중...</p>
                  </div>
                )}
                <div
                  ref={svgContainerRef}
                  className="w-full h-full"
                  style={{
                    transform: `scale(${mapScale}) translate(${mapPosition.x}px, ${mapPosition.y}px)`,
                    transformOrigin: 'center center',
                    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                    cursor: isDragging ? 'grabbing' : (mapScale > 1 ? 'grab' : 'default'),
                    minWidth: '100vw',
                    minHeight: '100vh',
                    margin: 0,
                    padding: 0,
                    touchAction: 'none',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    willChange: 'transform'
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onWheel={handleWheel}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                />

                {/* 확대/축소 버튼 */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                  <button onClick={handleScaleUp} className="bg-white/90 border border-gray-300 text-gray-500 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"><FaPlus /></button>
                  <button onClick={handleScaleDown} className="bg-white/90 border border-gray-300 text-gray-500 rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"><FaMinus /></button>
                </div>

                {/* 관악구/강남구 툴팁 
                {['관악구', '강남구'].some(area => selectedAreas.includes(area)) && (
                  <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
                    {['관악구', '강남구'].map((area) =>
                      selectedAreas.includes(area) ? (
                        <a
                          key={area}
                          href={
                            area === '관악구'
                              ? 'https://map.naver.com/p/entry/place/1306435818?c=15.00,0,0,0,dh'
                              : 'https://map.naver.com/p/entry/place/1280371285'
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm"
                        >
                          <div className="flex items-center gap-2 bg-yellow-400 text-black rounded-xl px-3 py-2 shadow-lg animate-fade-in hover:bg-yellow-500 transition-colors">
                            <img src="/HomeSearch.svg" alt="집 찾기" className="w-7 h-7" />
                            <span className="font-semibold"><b>{area}</b> 집을 찾고 계신가요?</span>
                          </div>
                        </a>
                      ) : null
                    )}
                  </div>
                )}*/}

                {/* 우측 상단 필터/키워드 버튼 */}
                <div className="fixed top-4 left-4 z-50 flex gap-2">
                  <Button
                    className="bg-black text-white border border-black rounded-full w-40 h-9 px-4 sm:px-6 shadow-lg font-semibold flex items-center hover:bg-gray-700 transition-all hover:shadow-xl whitespace-nowrap"
                    onClick={() => setRegionId(null)}
                  >
                    <MdOutlineMap className="w-5 h-5" />
                    전국지도
                  </Button>
                  <button
                    onClick={() => handleModalButtonClick('region')}
                    className="bg-black text-white border border-black rounded-full w-36 h-9 px-4 sm:px-6 shadow-lg font-semibold flex items-center hover:bg-gray-700 transition-all hover:shadow-xl whitespace-nowrap "
                  >
                    {nationRegionList.find(r => r.id === decodeURIComponent(regionId))?.label || '지역'}　
                    <FaChevronDown className="w-4 h-4 ml-4" />
                  </button>
                  <button
                    onClick={() => handleModalButtonClick('filter')}
                    className="bg-white border border-black text-black rounded-full h-9 px-4 sm:px-6 shadow-lg font-semibold flex items-center hover:bg-gray-50 transition-all hover:shadow-xl whitespace-nowrap text-xs"
                  >
                    <MdFilterAlt className="w-4 h-4 mr-1" />
                    필터
                  </button>
                  <button
                    onClick={() => handleModalButtonClick('keyword')}
                    className={`flex items-center rounded-full h-9 px-4 sm:px-6 shadow-lg font-semibold border transition-all hover:shadow-xl whitespace-nowrap text-xs ${
                      showKeywords
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white border-black text-black hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm mr-1">Aa</span>
                    키워드
                  </button>
                </div>
              </div>
            </div>

            {/* 우측 리스트 영역 */}
            <div className="w-[420px] h-full bg-white/95 backdrop-blur-sm shadow-2xl flex flex-col">
              {/* 정렬 바 */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-sm p-4 border-b border-gray-100 z-10 shadow-sm">
                <div className="flex flex-row items-center justify-between gap-4 w-full flex-nowrap">
                  <h3 className="text-gray-500 text-sm font-bold text-gray-500 whitespace-nowrap flex-shrink-0">
                    {/* {selectedAreas.length > 0 ? `${selectedAreas.join(', ')}` : '전체'} */}
                    <span className="ml-2">
                      {filteredVideos.length}개의 집을 찾았어요
                    </span>
                  </h3>

                  {/* 오른쪽: 정렬 버튼 */}
                    <div className="flex flex-row gap-2 flex-shrink-0 whitespace-nowrap">
                    <button
                      onClick={() => handleSort('date')}
                      className={`px-3 py-1 rounded-full text-xs border transition-all hover:shadow-md ${
                        sortType === 'date'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      날짜순 {sortType === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                    <button
                      onClick={() => handleSort('price')}
                      className={`px-3 py-1 rounded-full text-xs border transition-all hover:shadow-md ${
                        sortType === 'price'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      가격순 {sortType === 'price' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                    <button
                      onClick={() => handleSort('size')}
                      className={`px-3 py-1 rounded-full text-xs border transition-all hover:shadow-md ${
                        sortType === 'size'
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      크기순 {sortType === 'size' && (sortOrder === 'desc' ? '↓' : '↑')}
                    </button>
                  </div>

                </div>
              </div>

              {/* 선택된 필터/키워드 태그들 */}
              {(selectedAreas.length > 0 || contractTypes.length > 0 || houseTypes.length > 0 || sizes.length > 0 || selectedKeywords.length > 0) && (
                <div className="flex flex-wrap gap-2 px-4 pt-2 pb-2 border-b border-gray-100">
                  {selectedAreas.map(area => (
                    <span key={area} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs flex items-center">
                      {area}
                      <button onClick={() => handleAreaClick(area)} className="ml-1 text-blue-400 hover:text-blue-600">
                        <IoClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {contractTypes.map(type => (
                    <span key={type} className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs flex items-center">
                      {type}
                      <button onClick={() => handleFilterChange('contract', type)} className="ml-1 text-green-400 hover:text-green-600">
                        <IoClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {houseTypes.map(type => (
                    <span key={type} className="bg-purple-50 text-purple-600 px-3 py-1 rounded-full text-xs flex items-center">
                      {type}
                      <button onClick={() => handleFilterChange('houseType', type)} className="ml-1 text-purple-400 hover:text-purple-600">
                        <IoClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {sizes.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {getGroupedSizes(sizes).map(size => (
                        <span key={size} className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs flex items-center">
                          {size}
                          <button onClick={() => {
                            const sizeValues = size.split(/[~]/).map(s => s.replace('평대', ''));
                            const newSizes = sizes.filter(s => {
                              const value = s === '~5평대' ? 5 : s === '10평대~' ? 10 : parseInt(s);
                              return !(value >= parseInt(sizeValues[0]) && value <= parseInt(sizeValues[sizeValues.length - 1]));
                            });
                            setSizes(newSizes);
                          }} className="ml-1 text-orange-400 hover:text-orange-600">
                            <IoClose className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  {selectedKeywords.map(keyword => (
                    <span key={keyword} className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
                      {keyword}
                      <button
                        onClick={() => setSelectedKeywords(prev => prev.filter(k => k !== keyword))}
                        className="ml-1 text-yellow-400 hover:text-yellow-600"
                      >
                        <IoClose className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* 비디오 목록 */}
              <div
                className="flex-1 overflow-y-auto"
                onWheel={(e) => {
                  const container = e.currentTarget;
                  const scrollAmount = e.deltaY;
                  container.scrollTop += scrollAmount;
                }}
              >
                <div className="p-4">

                  <RegionMapList
                    videos={filteredVideos}
                    getSortedVideos={getSortedVideos}
                    formatDeposit={formatDeposit}
                    formatSize={formatSize}
                  />
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* 필터 모달 */}
      {showFilters && (
        <RegionMapFilter
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filterPanelRef={filterPanelRef}
          selectedAreas={selectedAreas}
          setSelectedAreas={setSelectedAreas}
          contractTypes={contractTypes}
          setContractTypes={setContractTypes}
          houseTypes={houseTypes}
          setHouseTypes={setHouseTypes}
          sizes={sizes}
          setSizes={setSizes}
          regionOptions={regionOptions}
          handleFilterChange={handleFilterChange}
          resetFilters={resetFilters}
          contractOptions={contractOptions}
          houseTypeOptions={houseTypeOptions}
          sizeOptions={sizeOptions}
        />
      )}

      {/* 키워드 모달 */}
      {showKeywords && (
        <RegionMapKeyword
          showKeywords={showKeywords}
          setShowKeywords={setShowKeywords}
          recommendedKeywords={recommendedKeywords}
          selectedKeywords={selectedKeywords}
          setSelectedKeywords={setSelectedKeywords}
        />
      )}

      {/* 지역 선택 모달 */}
      {showRegionModal && (
        <RegionSelectModal
          show={showRegionModal}
          onClose={() => setShowRegionModal(false)}
          regionList={nationRegionList}
          currentRegionId={regionId}
          setRegionId={setRegionId}
        />
      )}
    </div>
  );
};

export default RegionMap;
