/**
 * 부동산 검색을 위한 키워드 선택 모달 컴포넌트
 *
 * 주요 기능:
 * 1. 추천 키워드 목록 표시
 * 2. 키워드 선택/해제
 * 3. 선택된 키워드 하이라이트 표시
 */
import { IoClose } from 'react-icons/io5';

const RegionMapKeyword = ({
  showKeywords,           // 키워드 모달 표시 여부
  setShowKeywords,        // 키워드 모달 표시 상태 변경 함수
  recommendedKeywords,    // 추천 키워드 목록
  selectedKeywords,       // 현재 선택된 키워드 목록
  setSelectedKeywords     // 선택된 키워드 목록 변경 함수
}) => {
  // 모달이 닫혀있으면 아무것도 표시하지 않음
  if (!showKeywords) return null;

  return (
    // 모달 배경 (반투명 오버레이)
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/5 backdrop-blur-[2px]">
      {/* 모달 컨테이너 */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[calc(100%-2rem)] sm:w-[600px] relative border border-gray-100">
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">추천 키워드</h3>
          {/* 닫기 버튼 */}
          <button
            onClick={() => setShowKeywords(false)}
            className="text-gray-400 hover:text-blue-500"
          >
            <IoClose className="w-7 h-7" />
          </button>
        </div>

        {/* 키워드 목록 */}
        <div className="flex flex-wrap gap-2">
          {recommendedKeywords.map((keyword, index) => (
            <button
              key={index}
              onClick={() => {
                // 키워드 선택/해제 토글
                if (selectedKeywords.includes(keyword)) {
                  setSelectedKeywords(prev => prev.filter(k => k !== keyword));
                } else {
                  setSelectedKeywords(prev => [...prev, keyword]);
                }
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                selectedKeywords.includes(keyword)
                  ? 'bg-blue-500 text-white'  // 선택된 키워드 스타일
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'  // 일반 키워드 스타일
              }`}
            >
              {keyword}
            </button>
          ))}
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowKeywords(false)}
            className="bg-blue-500 text-white rounded-full px-8 py-2 font-semibold hover:bg-blue-600 transition-colors"
          >
            적용
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegionMapKeyword;
