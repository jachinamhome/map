import { useRef, useEffect } from 'react';
import { createCenteredText } from '@/utils/svgTextUtils';

const RegionMapSVG = ({
  regionId,
  selectedAreas,
  hoveredArea,
  setHoveredArea,
  handleAreaClick,
  dragStartRef,
  mapScale,
  mapPosition,
  isDragging,
  setIsDragging,
  setMapPosition,
  setLoading,
  setSvgLoaded,
  setRegionOptions,
  updateSelectedAreasHighlight,
  isMobile,
  mapFolded,
  svgLoaded,
  mapContainerRef,
  svgContainerRef
}) => {
  // SVG 로드 로직은 부모 컴포넌트로 이동
  return null; // 실제 SVG는 부모에서 ref로 렌더링
};

export default RegionMapSVG;