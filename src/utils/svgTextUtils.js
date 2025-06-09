/**
 * SVG 지도에서 지역명 텍스트를 배치하고 관리하는 유틸리티 함수들
 *
 * 주요 기능:
 * 1. SVG 요소의 중심점 계산
 * 2. 텍스트 위치 자동 조정
 * 3. 지역별 특수 케이스 처리
 * 4. 텍스트 스타일링 및 가시성 개선
 */

/**
 * SVG 요소의 중심점을 계산하고 텍스트 위치를 조정하는 함수
 * @param {string} regionId - 지역 ID (예: '서울특별시', '경기도' 등)
 * @param {SVGElement} element - SVG path, polyline, polygon 요소
 * @param {string} text - 표시할 텍스트
 * @param {Object} options - 추가 옵션
 * @returns {SVGTextElement} 생성된 텍스트 요소
 */
export const createCenteredText = (regionId, element, text, options = {
  regionId,
}) => {
  const {
    minPadding = 20,        // 텍스트와 경계선 사이의 최소 거리
    minAreaSize = 150,      // 작은 영역으로 간주할 최소 크기
    fontSize = '14px',      // 텍스트 크기
    fontWeight = '700',     // 텍스트 두께
    textColor = '#444444',  // 텍스트 색상
    xOffset = 0,            // x축 위치 보정값
    yOffset = 0,            // y축 위치 보정값
  } = options;

  let center = null;
  const id = element.getAttribute('id');
  if (!center && ['polygon', 'polyline', 'path'].includes(element.tagName)) {
    center = getPolygonCentroid(element);
    // centroid가 polygon 내부에 있는지 확인, 아니면 bbox 중심 사용
    if (center && !isPointInPolygon(center, element)) {
      const bbox = element.getBBox();
      center = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
    }
  }
  // path는 복잡하므로 일단 bbox 중심 사용 (추후 개선 가능)
  if (!center) {
    const bbox = element.getBBox();
    center = { x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 };
  }

  const specialCases = {
    '서울특별시' : {
      '종로구': { x: center.x - 10, y: center.y + 40 },
      '서초구': { x: center.x - 40, y: center.y },
      '강남구': { x: center.x - 20, y: center.y },
      '양천구': { x: center.x, y: center.y + 15},
      '동작구': { x: center.x + 10, y: center.y - 15},
      '강북구': { x: center.x, y: center.y + 30},
      '성북구': { x: center.x, y: center.y + 20},
      '서대문구': { x: center.x + 10, y: center.y + 20},
      '구로구': { x: center.x - 30, y: center.y - 5},
    },
    "부산광역시": {
      "해운대구": {x: center.x - 10, y: center.y + 20},
      '강서구': {x: center.x, y: center.y - 30},
      '서구': {x: center.x, y: center.y - 40},
      '연제구': {x: center.x, y: center.y - 10},
    },
    '광주광역시': {
      '남구': {x: center.x + 20, y: center.y + 30},
    },
    '강원특별자치도': {
      '철원군': {x: center.x - 30, y: center.y},
      '양구군': {x: center.x - 10, y: center.y},
      '고성군': {x: center.x , y: center.y + 30},
      '횡성군': {x: center.x + 20, y: center.y - 10},
      '원주시': {x: center.x - 10, y: center.y},
      '영월군': {x: center.x - 10, y: center.y + 10},
      '평창군': {x: center.x - 20, y: center.y + 10},
      '강릉시': {x: center.x + 10, y: center.y},
      '동해시': {x: center.x, y: center.y + 10},
      '삼척시': {x: center.x + 10, y: center.y - 20},
      '태백시': {x: center.x, y: center.y + 30},
    },
    '충청북도': {
      '음성군': {x: center.x - 20, y: center.y + 30},
      '증평군': {x: center.x , y: center.y - 20},
      '청주시': {x: center.x, y: center.y - 30},
      '충주시': {x: center.x - 10, y: center.y - 10},
      '제천시': {x: center.x + 20, y: center.y },
      '보은군': {x: center.x, y: center.y - 10},
      '단양군': {x: center.x - 40, y: center.y - 10},
    },
    '충청남도': {
      '서산시': {x: center.x, y: center.y + 30},
      '예산군': {x: center.x + 10, y: center.y},
      '서천군': {x: center.x + 20, y: center.y},
      '보령시': {x: center.x + 100, y: center.y + 10},
    },
    '경기도': {
      '김포시': {x: center.x - 30, y: center.y},
      '시흥시': {x: center.x + 20, y: center.y },
      '여주시': {x: center.x + 20, y: center.y},
      '안산시': {x: center.x + 100, y: center.y - 60},
    },
    '전라북도': {
      '부안군': {x: center.x + 80, y: center.y},
      '완주군': {x: center.x + 20, y: center.y - 40},
      '군산시': {x: center.x + 100, y: center.y},
    },
    '전라남도': {
      '여수시': {x: center.x + 40, y: center.y - 110},
      '신안군': {x: center.x + 80, y: center.y - 70},
      '영광군': {x: center.x + 40, y: center.y + 20},
      '장성군': {x: center.x, y: center.y + 20},
      '곡성군': {x: center.x + 10, y: center.y},
      '보성군': {x: center.x - 20, y: center.y},
      '진도군': {x: center.x + 40, y: center.y - 30},
      '해남군': {x: center.x + 10, y: center.y - 10},
      '영암군': {x: center.x + 10, y: center.y},
      '장흥군': {x: center.x, y: center.y - 30},
    },
    '경상북도': {
      '문경시': {x: center.x, y: center.y + 10},
      '경산시': {x: center.x - 10, y: center.y},
      '청송군': {x: center.x + 10, y: center.y},
      '청도군': {x: center.x, y: center.y + 10},
      '포항시': {x: center.x - 10, y: center.y - 10},
    },
  }
  if (specialCases[regionId] && specialCases[regionId][id]) {
    center = specialCases[regionId][id];
  }

  // x, y 오프셋 적용
  center.x += xOffset;
  center.y += yOffset;

  // 텍스트 요소 생성
  const textElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
  textElement.setAttribute("x", center.x);
  textElement.setAttribute("y", center.y);
  textElement.setAttribute("text-anchor", "middle");
  textElement.setAttribute("dominant-baseline", "middle");
  textElement.setAttribute("fill", textColor);
  textElement.setAttribute("font-size", fontSize);
  textElement.setAttribute("font-weight", fontWeight);
  textElement.setAttribute("pointer-events", "none");
  textElement.setAttribute("filter", "drop-shadow(0px 1px 1px rgba(255,255,255,0.8))");
  textElement.textContent = text;

  return textElement;
};

/**
 * polygon/polyline의 중심점(centroid)을 계산하는 함수
 * 기하학적 중심을 계산하여 텍스트 배치의 기준점으로 사용
 *
 * @param {SVGPolygonElement|SVGPolylineElement} element - SVG 다각형 요소
 * @returns {{x: number, y: number}|null} 중심점 좌표 또는 null
 */
function getPolygonCentroid(element) {
  const pointsAttr = element.getAttribute('points') || element.getAttribute('d');
  if (!pointsAttr) return null;
  const points = pointsAttr.trim().split(/\s+/).map(pt => pt.split(',').map(Number));
  if (points.length < 3) return null;

  let area = 0, cx = 0, cy = 0;
  for (let i = 0, len = points.length, j = len - 1; i < len; j = i++) {
    const [x0, y0] = points[j];
    const [x1, y1] = points[i];
    const f = x0 * y1 - x1 * y0;
    area += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  area = area / 2;
  if (area === 0) return null;
  cx = cx / (6 * area);
  cy = cy / (6 * area);
  return { x: cx, y: cy };
}

/**
 * 점이 polygon 내부에 있는지 확인하는 함수
 * Ray-casting 알고리즘을 사용하여 점의 위치를 판단
 *
 * @param {{x:number, y:number}} point - 확인할 점의 좌표
 * @param {SVGPolygonElement|SVGPolylineElement} element - SVG 다각형 요소
 * @returns {boolean} 점이 다각형 내부에 있는지 여부
 */
function isPointInPolygon(point, element) {
  const pointsAttr = element.getAttribute('points') || element.getAttribute('d');
  if (!pointsAttr) return false;
  const points = pointsAttr.trim().split(/\s+/).map(pt => pt.split(',').map(Number));
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i][0], yi = points[i][1];
    const xj = points[j][0], yj = points[j][1];
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi + 0.00001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * 텍스트 위치를 경계를 고려하여 조정하는 함수
 * 텍스트가 영역 경계를 벗어나지 않도록 위치를 보정
 *
 * @param {DOMRect} bbox - 요소의 경계 상자
 * @param {number} minPadding - 경계와의 최소 거리
 * @param {number} minAreaSize - 작은 영역으로 간주할 최소 크기
 * @returns {{adjustedX: number, adjustedY: number}} 조정된 좌표
 */
const calculateAdjustedPosition = (bbox, minPadding, minAreaSize) => {
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  let adjustedX = centerX;
  let adjustedY = centerY;

  // 영역이 충분히 큰 경우 중심점 사용
  if (bbox.width >= minAreaSize && bbox.height >= minAreaSize) {
    return { adjustedX, adjustedY };
  }

  // 경계와의 거리 계산
  const leftDist = centerX - bbox.x;
  const rightDist = bbox.x + bbox.width - centerX;
  const topDist = centerY - bbox.y;
  const bottomDist = bbox.y + bbox.height - centerY;

  // 영역의 크기에 따라 동적으로 패딩 조정
  const dynamicPadding = Math.min(
    minPadding,
    Math.min(bbox.width, bbox.height) * 0.3
  );

  // 가장 가까운 경계의 반대 방향으로 이동
  if (leftDist < rightDist) {
    // 왼쪽 경계가 더 가까우면 오른쪽으로 이동
    adjustedX += dynamicPadding;
  } else {
    // 오른쪽 경계가 더 가까우면 왼쪽으로 이동
    adjustedX -= dynamicPadding;
  }

  if (topDist < bottomDist) {
    // 위쪽 경계가 더 가까우면 아래로 이동
    adjustedY += dynamicPadding;
  } else {
    // 아래쪽 경계가 더 가까우면 위로 이동
    adjustedY -= dynamicPadding;
  }

  // 경계를 벗어나지 않도록 보정
  adjustedX = Math.max(bbox.x + dynamicPadding, Math.min(bbox.x + bbox.width - dynamicPadding, adjustedX));
  adjustedY = Math.max(bbox.y + dynamicPadding, Math.min(bbox.y + bbox.height - dynamicPadding, adjustedY));

  return { adjustedX, adjustedY };
};
