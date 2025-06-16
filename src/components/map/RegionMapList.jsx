/**
 * 부동산 정보 목록을 표시하는 컴포넌트
 *
 * 주요 기능:
 * 1. 부동산 정보 카드 형태로 표시
 * 2. 유튜브 썸네일 및 링크 제공
 * 3. 계약 유형별 가격 정보 표시
 * 4. 지역, 면적, 역 정보 표시
 */
import { FaYoutube } from 'react-icons/fa';

const RegionMapList = ({
  videos,              // 부동산 정보 목록
  getSortedVideos,    // 정렬된 부동산 목록을 반환하는 함수
  formatDeposit,      // 보증금/매매가 포맷팅 함수
  formatSize          // 면적 포맷팅 함수
}) => {
  return (
    // 부동산 목록 그리드
    <div className="grid grid-cols-1 gap-4">
      {getSortedVideos(videos).map((video, index) => (
        // 부동산 정보 카드
        <div key={`${video.youtube || ''}-${index}`} className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-200 overflow-hidden group">
          {/* 유튜브 썸네일 영역 */}
            <a
              href={`https://www.youtube.com/watch?v=${video.youtube}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block aspect-video relative overflow-hidden"
            >
              <img
                src={`https://img.youtube.com/vi/${video.youtube}/0.jpg`}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </a>

          {/* 부동산 정보 영역 */}
          <div className="p-5">
            <div className="text-sm text-black space-y-1">
              {/* 1. 지역명 */}
              <p className="font-bold">{video.area}{video.area2 ? ` ${video.area2}` : ''}</p>

              {/* 2. 가격 및 계약 정보 */}
              {(
                video.contract === '월세' ? (
                  <p className="font-bold text-2xl">{video.contract} {formatDeposit(video.deposit ?? 0)}/{video.rent}</p>
                ) : video.contract === '전세' ? (
                  <p className="font-bold text-2xl">{video.contract} {formatDeposit(video.deposit ?? 0)}</p>
                ) : video.contract === '매매' ? (
                  <p className="font-bold text-2xl">{video.contract} {formatDeposit(video.deposit ?? video.sale ?? 0)}</p>
                ) : null
              )}

              {/* 3. 면적 정보 */}
              <p>{formatSize((video.type), video.size)}</p>

              {/* 4. 역 정보 */}
              <p>{video.station}</p>

              {/* 5. 태그 정보 */}
              {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {video.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            </div>

              {/* 유튜브 링크 
            <a
              href={"https://www.youtube.com/watch?v=" + video.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 text-xs font-semibold hover:underline mt-3 inline-block items-center gap-1"
            >
              <FaYoutube className="inline-block w-4 h-4 mr-1" />
              유튜브 보기
            </a>*/}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RegionMapList;
