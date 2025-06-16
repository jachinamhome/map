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
import { HiOutlineLocationMarker } from 'react-icons/hi';
import { FaWonSign } from "react-icons/fa6";
import { TbBuildingCommunity } from 'react-icons/tb';
import { LuRuler } from 'react-icons/lu';
import { GiSubway } from 'react-icons/gi';


// 지역 표기 예외: 서울만 지역명 생략
const regionNameExceptions = {
  '서울특별시': true,
  '경기도': true
};



// 지역명 축약 매핑
const regionAbbreviation = {
  '서울특별시': '서울시',
  '경기도': '경기도',
  '인천광역시': '인천',
  '부산광역시': '부산',
  '대구광역시': '대구',
  '광주광역시': '광주',
  '대전광역시': '대전',
  '울산광역시': '울산',
  '세종특별자치시': '세종',
  '강원특별자치도': '강원',
  '충청북도': '충북',
  '충청남도': '충남',
  '전북특별자치도': '전북',
  '전라남도': '전남',
  '경상북도': '경북',
  '경상남도': '경남',
  '제주특별자치도': '제주',
};


// 영상 리스트 지역명 축약 표기 함수
const formatLocation = (video) => {
  const region = video.region?.trim() || '';
  const area = video.area?.trim() || '';
  const area2 = video.area2?.trim() || '';

  const skipRegion = regionNameExceptions[region];
  const shortRegion = regionAbbreviation[region] || region;

  return skipRegion
    ? `${area} ${area2}`.trim()
    : `${shortRegion} ${area} ${area2}`.trim();
};




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
            <div className="text-base text-black space-y-1">

              {/* 1. 지역 */}
              <div className="flex items-center gap-1">
                <HiOutlineLocationMarker className="w-4 h-4 text-gray-500" />
                <p className="font-bold text-sm">{formatLocation(video)}</p>
              </div>

              {/* 2. 가격 및 계약 */}
              {video.contract && (video.deposit) && (
              <div className="flex items-center gap-1">
                <FaWonSign className="w-4 h-4 text-gray-500 pt-1" />
                {video.contract === '월세' || video.contract === '반전세' ? (
                  <p className="font-bold text-xl text-black">
                    {video.contract} {formatDeposit(video.deposit ?? 0)}/{video.rent}
                  </p>
                ) : video.contract === '전세' ? (
                  <p className="font-bold text-xl text-black">
                    {video.contract} {formatDeposit(video.deposit ?? 0)}
                  </p>
                ) : video.contract === '매매' ? (
                  <p className="font-bold text-xl text-black">
                    {video.contract} {formatDeposit(video.deposit ?? video.sale ?? 0)}
                  </p>
                ) : null}
              </div>
              )}

              {/* 3. 형태 + 실평수 */}
              {video.type && (video.size) && (
              <div className="flex items-center gap-1">
                <TbBuildingCommunity className="w-4 h-4 text-gray-500" />
                <p className="font-medium text-black">{formatSize((video.type), video.size)}</p>
              </div>
              )}

              {/* 4. 인근역 */}
              {video.station && (
              <div className="flex items-center gap-1">
                <GiSubway className="w-4 h-4 text-gray-500" />
                <p className="font-medium text-sm text-gray-500">{video.station}</p>
              </div>
              )}

              {/* 5. 태그 */}
              {video.tags && video.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {video.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
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
