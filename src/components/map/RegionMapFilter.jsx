/**
 * 지역별 부동산 필터 모달 컴포넌트
 *
 * 이 컴포넌트는 부동산 정보를 필터링할 수 있는 모달 창을 제공합니다.
 * 사용자는 다음 항목들을 필터링할 수 있습니다:
 * 1. 지역: 특정 지역의 부동산만 보기
 * 2. 계약 유형: 월세, 전세, 매매 중 선택
 * 3. 주거 유형: 원룸, 빌라, 오피스텔, 아파트 중 선택
 * 4. 면적: 원하는 평수 범위 선택
 */
import { IoClose } from 'react-icons/io5';

const RegionMapFilter = ({
  showFilters,        // 필터 모달 표시 여부
  setShowFilters,     // 필터 모달 표시 상태 변경 함수
  filterPanelRef,     // 필터 패널 DOM 참조
  selectedAreas,      // 선택된 지역 목록
  setSelectedAreas,   // 선택된 지역 목록 변경 함수
  contractTypes,      // 선택된 계약 유형 목록
  setContractTypes,   // 선택된 계약 유형 목록 변경 함수
  houseTypes,         // 선택된 주거 유형 목록
  setHouseTypes,      // 선택된 주거 유형 목록 변경 함수
  sizes,              // 선택된 면적 목록
  setSizes,           // 선택된 면적 목록 변경 함수
  regionOptions,      // 지역 선택 옵션 목록
  handleFilterChange, // 필터 변경 처리 함수
  resetFilters,       // 필터 초기화 함수
  contractOptions,    // 계약 유형 옵션 목록
  houseTypeOptions,   // 주거 유형 옵션 목록
  sizeOptions         // 면적 옵션 목록
}) => {
  /**
   * 선택된 면적들을 연속된 범위로 그룹화하는 함수
   *
   * 예시:
   * - 입력: ['5평대', '6평대', '7평대', '8평대']
   * - 출력: ['5~8평대']
   *
   * @param {string[]} selectedSizes - 선택된 면적 배열
   * @returns {string[]} 그룹화된 면적 문자열 배열
   */
  const getGroupedSizes = (selectedSizes) => {
    if (selectedSizes.length === 0) return [];

    // 면적 문자열을 숫자로 변환
    // 예: '5평대' -> 5, '10평대~' -> 10
    const sizeValues = selectedSizes.map(size => {
      if (size === '~5평대') return 5;
      if (size === '10평대~') return 10;
      return parseInt(size);
    }).sort((a, b) => a - b);

    // 연속된 숫자들을 그룹화
    // 예: [5,6,7,8] -> [[5,6,7,8]]
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

    // 그룹을 문자열로 변환
    // 예: [[5,6,7,8]] -> ['5~8평대']
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

  // 모달이 닫혀있으면 아무것도 표시하지 않음
  if (!showFilters) return null;

  return (
    // 모달 배경 (반투명 오버레이)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-[2px]">
      {/* 모달 컨테이너 */}
      <div ref={filterPanelRef} className="bg-white rounded-2xl shadow-2xl p-6 w-[calc(100%-1rem)] sm:w-[600px] max-h-[90vh] my-4 relative border border-gray-100 flex flex-col">
        {/* 닫기 버튼 */}
        <button
          onClick={() => setShowFilters(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-blue-500"
          aria-label="닫기"
        >
          <IoClose className="w-7 h-7" />
        </button>

        {/* 모달 헤더 */}
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold text-gray-800">필터</h3>
        </div>

        {/* 스크롤 가능한 필터 컨텐츠 영역 */}
        <div className="overflow-y-auto flex-1">
          {/* 지역 필터 섹션 */}
          {regionOptions.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">지역</h4>
            <div className="grid grid-cols-4 gap-2">
              {/* 전체 선택 버튼 */}
              <button
                key="전체"
                onClick={() => setSelectedAreas([])}
                className={`px-3 py-1 rounded-full text-sm ${
                  selectedAreas.length === 0
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700'
                }`}
              >
                전체
              </button>
              {/* 지역 옵션 버튼들 */}
              {regionOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (selectedAreas.includes(opt.value)) {
                      setSelectedAreas(selectedAreas.filter(id => id !== opt.value));
                    } else {
                      setSelectedAreas([...selectedAreas, opt.value]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedAreas.includes(opt.value)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
                ))}
              </div>
            </div>
          )}

          {/* 계약 유형 필터 섹션 */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">계약</h4>
            <div className="flex flex-wrap gap-2">
              {contractOptions.map(type => (
                <button
                  key={type}
                  onClick={() => handleFilterChange('contract', type)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    contractTypes.includes(type)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 주거 유형 필터 섹션 */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">형태</h4>
            <div className="flex flex-wrap gap-2">
              {houseTypeOptions.map(type => (
                <button
                  key={type}
                  onClick={() => handleFilterChange('houseType', type)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    houseTypes.includes(type)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 면적 필터 섹션 */}
          <div className="mb-4">
            <h4 className="font-semibold mb-2">면적</h4>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map(size => (
                <button
                  key={size}
                  onClick={() => handleFilterChange('size', size)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    sizes.includes(size)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {/* 선택된 면적 표시 */}
            {sizes.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                선택된 면적: {getGroupedSizes(sizes).join(', ')}
              </div>
            )}
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex justify-between items-center mt-4 gap-6 pt-4 border-t border-gray-100">
          {/* 초기화 버튼 */}
          <button
            onClick={resetFilters}
            className="text-sm text-blue-500 hover:text-blue-600 font-semibold px-4 py-2 border-2 border-blue-500 hover:border-blue-600 rounded-full transition-colors"
          >
            초기화
          </button>
          {/* 적용 버튼 */}
          <button
            onClick={() => setShowFilters(false)}
            className="bg-blue-500 text-white rounded-full px-6 py-2 font-semibold text-sm shadow-lg hover:bg-blue-600 transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionMapFilter;
