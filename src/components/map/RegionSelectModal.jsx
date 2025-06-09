/**
 * 지역 선택 모달 컴포넌트
 *
 * 이 컴포넌트는 전국 시/도 단위의 지역을 선택할 수 있는 모달 창을 제공합니다.
 * 주요 기능:
 * 1. 전국 17개 시/도 중 원하는 지역 선택
 * 2. 현재 선택된 지역 하이라이트 표시
 * 3. 지역 선택 시 해당 지역의 지도로 이동
 */
import { useRouter } from 'next/navigation';

export default function RegionSelectModal({
  show,              // 모달 표시 여부
  onClose,           // 모달 닫기 함수
  regionList,        // 지역 목록 데이터
  currentRegionId,   // 현재 선택된 지역 ID
  setRegionId        // 지역 ID 변경 함수
}) {
  // 페이지 이동을 위한 라우터
  const router = useRouter();

  // 모달이 닫혀있으면 아무것도 표시하지 않음
  if (!show) return null;

  return (
    // 모달 배경 (반투명 오버레이)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      {/* 모달 컨테이너 */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90vw] max-w-xs flex flex-col gap-2 relative border border-gray-100 max-h-[90vh] overflow-y-auto">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-blue-500 text-xl font-bold"
          aria-label="닫기"
        >
          ×
        </button>

        {/* 모달 헤더 */}
        <h3 className="text-lg font-bold mb-4 text-center">지역 선택</h3>

        {/* 지역 목록 */}
        <div className="flex flex-col gap-2">
          {regionList.map(r => (
            <button
              key={r.id}
              onClick={() => {
                // 현재 선택된 지역과 다른 지역을 선택한 경우에만 처리
                if (r.id !== currentRegionId) {
                  setRegionId(r.id);
                  // 라우터 이동은 현재 비활성화 상태
                  //router.push(`/region/${encodeURIComponent(r.id)}`);
                }
                onClose();
              }}
              className={`px-3 py-1 rounded-full text-sm font-normal border transition-colors ${
                r.id === currentRegionId
                  ? 'bg-black text-white border-black'  // 현재 선택된 지역 스타일
                  : 'bg-white text-black border-gray-300 hover:bg-gray-100'  // 일반 지역 스타일
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
